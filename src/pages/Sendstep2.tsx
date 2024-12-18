import { useEffect, useState } from "react";
import Header from "../components/Header";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { AiOutlineSwap } from "react-icons/ai";
import UserDropdown from "../components/UserDropdown";
import NetworkDropdown from "../components/NetworkDropdown";
import useWallet from "../hooks/useWallet";
import { formatWalletAddress } from "../utils";
import axios from "axios";
import { ethers } from "ethers";
import secp256k1 from "secp256k1";
import Jazzicon from "react-jazzicon/dist/Jazzicon";

interface AccountType {
    id: number,
    name: string,
    address: string,
    balance: number,
    balanceUSD: number,
    visible: boolean
}

interface Network {
    id: string;
    name: string;
    logo: string;
}

const networks: Network[] = [
    { id: "1", name: "WART", logo: "logo.png" },
    { id: "2", name: "ETH", logo: "icons/eth_logo.svg" },
    { id: "3", name: "BNB", logo: "icons/bnb_logo.png" },
    { id: "4", name: "POL", logo: "icons/pol.png" },
];

function SendFinalStep() {

    const { password, selectedWalletIndex, selectedNodeIndex, nameList, walletList, nodeList, tmpDestinationWallet, visibleWalletList, setSelectedWalletIndex, setName, setWallet, getPrivateKeyFromIndex } = useWallet();
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState<AccountType[]>([]);
    const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(networks[0]);
    const [isSwapped, setSwapped] = useState(false);
    const [amount, setAmount] = useState<number>(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [transactionHash, setTransactionHash] = useState<string>('');
    const [transactionError, setTransactionError] = useState<string>('');
    const [nonce, setNonce] = useState<number>(0);

    const selectUser = (id: number) => {
        setName(nameList[id]);
        setWallet(walletList[id]);
        setSelectedWalletIndex(id);
    };

    const handleSwap = () => {
        setSwapped((prev) => !prev); // Toggle the swap state
    };


    const handleTransaction = async () => {
        if (confirmPassword !== password) {
            setPasswordError("Incorrect password. Please try again.");
            return;
        }

        setIsProcessing(true);
        setTransactionStatus('processing');

        try {
            // Replace this with your actual transaction logic
            const headResponse = (await axios.get(`${nodeList[selectedNodeIndex]}/chain/head`)).data;
            const pinHash = headResponse.data.pinHash;
            const pinHeight = headResponse.data.pinHeight as number;
            const nonceId = nonce + 1;
            setNonce(nonceId);
            const rawFeeE8 = "9999";
            const result = (await axios.get(`${nodeList[selectedNodeIndex]}/tools/encode16bit/from_e8/` + rawFeeE8)).data;
            const feeE8 = result.data.roundedE8;

            const buf1 = Buffer.from(pinHash, "hex");
            const buf2 = Buffer.alloc(19);
            buf2.writeUInt32BE(pinHeight, 0);
            buf2.writeUInt32BE(nonceId, 4);
            buf2.writeUInt8(0, 8);
            buf2.writeUInt8(0, 9);
            buf2.writeUInt8(0, 10);
            buf2.writeBigUInt64BE(BigInt(feeE8), 11);
            const buf3 = Buffer.from(tmpDestinationWallet?.slice(0, 40) || "", "hex");
            const buf4 = Buffer.alloc(8);
            const amountE8 = Math.round(amount * 100000000);
            buf4.writeBigUInt64BE(BigInt(amountE8), 0);
            console.log(`**** amountE8:`, amountE8);
            const toSign = Buffer.concat([buf1, buf2, buf3, buf4]);
            console.log(`**** toSign:`, toSign);

            const signHash = ethers.sha256("0x" + toSign.toString("hex")).slice(2);
            console.log(`**** signHash:`, signHash);

            const privKey = getPrivateKeyFromIndex(selectedWalletIndex);
            console.log(`**** privKey:`, privKey);
            const signed = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(signHash, "hex")), Uint8Array.from(Buffer.from(privKey, "hex")));
            console.log(`**** signed:`, signed);
            const signatureWithoutRecid = Buffer.from(signed.signature);
            console.log(`**** signatureWithoutRecid:`, signatureWithoutRecid);
            const signatureWithoutRecidNormalized = secp256k1.signatureNormalize(
                signed.signature
            );
            let recid = signed.recid;
            console.log(`**** signatureWithoutRecidNormalized:`, signatureWithoutRecidNormalized);
            if (
                Buffer.compare(signatureWithoutRecid, signatureWithoutRecidNormalized) !== 0
            ) {
                recid = recid ^ 1;
            }
            console.log(`**** recid:`, recid);
            const recidBuffer = Buffer.alloc(1);
            console.log(`**** recidBuffer:`, recidBuffer);
            recidBuffer.writeUint8(recid);
            console.log(`**** recidBuffer:`, recidBuffer);
            const signature65 = Buffer.concat([signatureWithoutRecidNormalized, recidBuffer]);
            console.log(`**** signature65:`, signature65);
            const postdata = {
                pinHeight: pinHeight,
                nonceId: nonceId,
                toAddr: tmpDestinationWallet || "",
                amountE8: amountE8,
                feeE8: feeE8,
                signature65: signature65.toString("hex"),
            };

            console.log(`**** postdata:`, postdata);

            axios.post(`${nodeList[selectedNodeIndex]}/transaction/add`, postdata).then((res) => {
                console.log(`**** res:`, res.data);
                if(res.data?.error) {
                    setTransactionStatus('error');
                    setTransactionError(res.data.error);
                }
                else {
                    setTransactionHash(res?.data?.data?.txHash);
                    setTransactionStatus('success');
                }
            }).catch((error) => {
                console.log(`**** error:`, error);
                setTransactionStatus('error');
                setTransactionError(error instanceof Error ? error.message : 'Transaction failed');
            });

            // const result = await sendTransaction({
            //     from: accounts[selectedWalletIndex].address,
            //     to: tmpDestinationWallet,
            //     amount: amount,
            //     network: selectedNetwork?.id,
            //     token: selectedNetwork?.name
            // });
        } catch (error) {
            setTransactionStatus('error');
            setTransactionError(error instanceof Error ? error.message : 'Transaction failed');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (nameList.length !== walletList.length) {
            console.log(`**** unmatched error in nameList and walletList:`, nameList.length, walletList.length);
        }
        else {
            setAccounts(nameList.map((name, index) => ({
                id: index,
                name,
                address: walletList[index],
                balance: 0,
                balanceUSD: 0,
                visible: visibleWalletList[index]
            })))
        }
    }, [walletList, nameList, visibleWalletList])

    return (
        <div className="min-h-screen container relative">
            <Header title="Send" />

            <div className="flex flex-col gap-1">
                <p className="text-white text-sm">From</p>
                <UserDropdown users={accounts} selectedUser={accounts[selectedWalletIndex]} onSelectUser={selectUser} />
                <NetworkDropdown networks={networks} selectedNetwork={selectedNetwork} onSelectNetwork={setSelectedNetwork} handleSwap={handleSwap} isSwapped={isSwapped} amount={amount} setAmount={setAmount} />

                <p className="text-white text-sm mt-3">To</p>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/25 backdrop-blur-md">
                    {/* <img className="w-12 h-12 rounded-full" src="profile-image.png" alt="Profile" /> */}
                    { <Jazzicon diameter={48} seed={1000} /> }
                    <div>
                        <p className="text-white text-lg font-semibold">Receiver</p>
                        <p className="text-white/50 text-xs">{formatWalletAddress(tmpDestinationWallet || "")}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 p-4 rounded-lg border border-primary/25 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <img className="w-12 h-12 rounded-full" src={selectedNetwork?.logo} alt="logo" />
                        <div>
                            <p className="text-white text-lg font-semibold">{selectedNetwork?.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="text-right">
                            {isSwapped ? (
                                <>
                                    <p className="text-white text-lg">${amount}</p>
                                    <p className="text-white/50 text-sm">{amount} {selectedNetwork?.name}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-white text-lg">{amount} {selectedNetwork?.name}</p>
                                    <p className="text-white/50 text-sm">${amount}</p>
                                </>
                            )}
                        </div>
                        <AiOutlineSwap className="text-white rotate-90 text-2xl" onClick={handleSwap} />
                    </div>
                </div>

            </div>

            <div className="flex bottom-3 absolute left-0 px-3 w-full gap-3">
                <Button variant="outline" ariaLabel="Backup" className="w-full mt-5 hover:bg-primary/10" onClick={() => navigate('/home')}>
                    Cancel
                </Button>
                <Button variant="primary" ariaLabel="Continue" className="w-full mt-5" onClick={() => setShowConfirmation(true)}>
                    Continue
                </Button>
            </div>

            {/* Add Confirmation Popup */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-md w-full border border-primary/25">
                        {transactionStatus === 'idle' && (
                            <>
                                <h3 className="text-white text-xl font-semibold mb-4">Confirm Transaction</h3>
                                <div className="space-y-4 mb-6">
                                    <div className="bg-[#2A2A2A] p-4 rounded-lg">
                                        <p className="text-white/70 text-sm">Sending</p>
                                        <p className="text-white text-lg font-semibold">{amount} {selectedNetwork?.name}</p>
                                        <p className="text-white/50 text-sm">${amount}</p>
                                    </div>

                                    <div className="bg-[#2A2A2A] p-4 rounded-lg">
                                        <p className="text-white/70 text-sm">To</p>
                                        <p className="text-white text-lg font-semibold">Receiver</p>
                                        <p className="text-white/50 text-sm">{formatWalletAddress(tmpDestinationWallet || "")}</p>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-white/70 text-sm mb-2">
                                            Enter your password to confirm
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setPasswordError("");
                                            }}
                                            className="w-full bg-[#2A2A2A] border border-primary/25 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                            placeholder="Enter your password"
                                        />
                                        {passwordError && (
                                            <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setShowConfirmation(false);
                                            setConfirmPassword("");
                                            setPasswordError("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={handleTransaction}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Processing..." : "Confirm"}
                                    </Button>
                                </div>
                            </>
                        )}

                        {transactionStatus === 'processing' && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                                <h3 className="text-white text-xl font-semibold mb-2">Processing Transaction</h3>
                                <p className="text-white/70">Please wait while we process your transaction...</p>
                            </div>
                        )}

                        {transactionStatus === 'success' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-xl font-semibold mb-2">Transaction Successful!</h3>
                                <p className="text-white/70 mb-4">Your transaction has been processed successfully.</p>
                                <p className="text-sm text-white/50 break-all mb-6">
                                    Transaction Hash: <a href={`https://wartscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer" className="underline">{transactionHash}</a>
                                </p>
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => {
                                        setShowConfirmation(false);
                                        setTransactionStatus('idle');
                                        navigate('/home');
                                    }}
                                >
                                    Done
                                </Button>
                            </div>
                        )}

                        {transactionStatus === 'error' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-xl font-semibold mb-2">Transaction Failed</h3>
                                <p className="text-red-500 mb-6">{transactionError}</p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setShowConfirmation(false);
                                            setTransactionStatus('idle');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => {
                                            setTransactionStatus('idle');
                                            setTransactionError('');
                                        }}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SendFinalStep;