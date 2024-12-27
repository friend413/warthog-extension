import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import useWallet from "../hooks/useWallet";
import Jazzicon from "react-jazzicon/dist/Jazzicon";

function IconButton({ iconSrc, label, onClick }: { iconSrc: string; label: string; onClick?: () => void }) {
    return (
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onClick}>
            <div className="flex justify-center items-center w-16 h-16 bg-[#f1f1f1] rounded-full">
                <img src={iconSrc} alt={label} />
            </div>
            <div className="text-sm text-white">{label}</div>
        </div>
    );
}

function useDebounce(value: string | null, delay: number): string | null {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

function AccountDetails() {
    const { wallet, name, nameList, setNameList, selectedWalletIndex, setName } = useWallet();
    const [copyLabel, setCopyLabel] = useState("Copy");
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState<string | null>(name);
    const debouncedName = useDebounce(tempName, 1000);
    const navigate = useNavigate();

    const handleCopyAddress = () => {
        if (wallet) {
            navigator.clipboard.writeText(wallet)
                .then(() => {
                    setCopyLabel("Copied!");
                    setTimeout(() => setCopyLabel("Copy"), 2000);
                })
                .catch((err) => {
                    console.log("Failed to copy wallet address: ", err);
                });
        } else {
            alert("No wallet connected to copy.");
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    useEffect(() => {
        if (debouncedName !== name) {
            setName(debouncedName || "");
            setNameList(nameList.map((item, index) => index === selectedWalletIndex ? (debouncedName || "") : item ));
        }
    }, [debouncedName, name, nameList, selectedWalletIndex, setName, setNameList]);

    return (
        <div className="min-h-screen container relative">
            <BackButton />

            <div className="flex justify-center items-center gap-4 mt-6">
                {/* <img
                    className="w-20 h-20 rounded-full object-cover"
                    src="profile-image.png"
                    alt="Profile"
                /> */}
                { <Jazzicon diameter={80} seed={selectedWalletIndex} />}
                <div>
                    <div className="text-xl font-semibold text-white">
                        {isEditing ? (
                            <input
                                type="text"
                                value={tempName || ""}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={() => setIsEditing(false)} // Exit edit mode on blur
                                className="text-xl font-semibold text-white bg-transparent border-b border-white focus:outline-none max-w-28"
                                autoFocus
                                placeholder="Your Name"
                            />
                        ) : (
                            name || ""
                        )}
                    </div>
                    <div className="text-xs text-white/50">Connected Wallet</div>
                </div>
                <img
                    className="w-6 h-6 cursor-pointer"
                    src="icons/edit-2.svg"
                    alt="Edit Profile"
                    onClick={handleEditClick}
                />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 flex flex-col items-center gap-4 mt-6">
                <img
                    src="qrCode.png"
                    alt="QR Code to receive payment"
                    className="w-32 h-32"
                />
                <div className="text-sm text-gray-200 cursor-pointer" onClick={handleCopyAddress}>{wallet || "No wallet connected"}</div>
            </div>

            <div className="flex justify-center gap-10 mt-6">
                <IconButton iconSrc="icons/Icon-copy.svg" label={copyLabel} onClick={handleCopyAddress} />
            </div>

            <div className="w-full absolute bottom-3 left-0 px-3">
                <Button className="w-full" onClick={() => navigate('/private-key')}>
                    Show Private Key
                </Button>
            </div>
        </div>
    );
}

export default AccountDetails;
