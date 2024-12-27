import { useEffect, useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import AccountCard from "../components/AccountCard";
import useWallet from "../hooks/useWallet";

interface AccountType {
    id: number,
    name: string,
    address: string,
    balance: number,
    balanceUSD: number,
    visible: boolean
}

function ManageAccounts() {
    const { nameList, walletList, visibleWalletList, setName, setWallet, setSelectedWalletIndex, addAccount } = useWallet();

    const [accounts, setAccounts] = useState<AccountType[]>([] as AccountType[]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility
    const [newAccountName, setNewAccountName] = useState("");

    const handleAddAccount = () => {
        // Logic to add the new account
        console.log("Adding account:", newAccountName);

        addAccount(newAccountName.length ? newAccountName: null);

        // Reset the input and close the dialog
        setNewAccountName("");
        setIsDialogOpen(false);
    };

    const handleCancel = () => {
        setNewAccountName("");
        setIsDialogOpen(false);
    }

    const filteredAccounts = accounts.filter(
        (account) =>
            account.visible &&
            (
                account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.address.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    const setPrimaryAccount = (id: number) => {
        console.log("Primary Account Set");
        setName(nameList[id]);
        setWallet(walletList[id]);
        setSelectedWalletIndex(id);
    }

    // const removeAccount = (id: number) => {
    //     setVisibleWalletList(visibleWalletList.map((visible, index) => index !== id ? visible : false));
    //     console.log(`${name} removed from accounts`);
    // }

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
        <div className="min-h-screen container relative px-4">
            <Header title="Select an Account" />
            <div className="relative w-full">
                <input
                    className="h-14 w-full pl-12 pr-4 py-2 bg-primary/10 rounded-full border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <img
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6"
                    src="icons/search-icon.svg"
                    alt="Search Icon"
                />
            </div>
            <div className="h-[63vh] overflow-y-scroll">
                {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account, index) => (
                        <AccountCard
                            key={index}
                            {...account}
                            isLast={index === filteredAccounts.length - 1}
                            setPrimaryAccount={setPrimaryAccount}
                        />
                    ))
                ) : (
                    <div className="text-center text-white/50 mt-6">No accounts found</div>
                )}
            </div>
            <div className="absolute bottom-3 w-full left-0 px-4">
                <Button
                    variant="primary"
                    ariaLabel="Add Account"
                    onClick={() => setIsDialogOpen(true)}
                    className="w-full"
                >
                    + Add more account
                </Button>
            </div>

            {/* Popup Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-[#1A1A1A] p-4 rounded shadow-lg w-[300px]">
                        <h3 className="text-white text-xl font-semibold mb-4">Add new Account</h3>
                        <input
                            type="text"
                            placeholder="Account Name"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            className="w-full min-w-[150px] bg-[#2A2A2A] border border-primary/25 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                        />
                        <div className="flex justify-end mt-4">
                            <Button
                                variant="secondary"
                                onClick={handleCancel} // Close dialog
                                className="mr-2 w-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddAccount} // Add account
                                className="w-full"
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAccounts;
