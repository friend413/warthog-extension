import { useEffect, useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import useWallet from "../hooks/useWallet";
import NodeCard from "../components/NodeCard";
import axios from "axios";

interface NodeType {
    id: number,
    name: string,
    address: string,
    status: string,
    latency: number
}

function SelectNode() {
    const { wallet, nodeList, nodeNameList, selectedNodeIndex, setSelectedNodeIndex, setNodeList, setNodeNameList } = useWallet();
    
    const [nodes, setNodes] = useState<NodeType[]>([] as NodeType[]);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility
    const [newNodeAddress, setNewNodeAddress] = useState("");
    const [newNodeName, setNewNodeName] = useState("");
    const [warning, setWarning] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const filteredNodes = nodes.filter(
        (node) =>
            (
                node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                node.address.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    useEffect(() => console.log(filteredNodes), [filteredNodes]);

    const setPrimaryNode = (id: number) => {
        console.log("Primary Node Set");
        setSelectedNodeIndex(id);
    }

    const removeNode = (id: number) => {
        setNodeList(nodeList.filter((_, index) => index !== id));
        setNodeNameList(nodeNameList.filter((_, index) => index !== id));
        if( selectedNodeIndex >= id )
            setSelectedNodeIndex( Math.max(selectedNodeIndex - 1, 0) );
    }

    const handleAddNode = () => {
        // Logic to add the new node
        console.log("Adding node:", newNodeAddress);
        // Regular expression to validate URL format
        const urlPattern = /^(https?:\/\/)(([a-z0-9-]+\.)+[a-z]{2,}|(\d{1,3}\.){3}\d{1,3})(:\d{1,5})?(\/.*)?$/i;

        if (newNodeAddress.length === 0) {
            setWarning(true);
            return;
        }

        if (!urlPattern.test(newNodeAddress)) {
            setWarning(true); // Set warning if the address is invalid
            return;
        }

        const len = nodeList.length;
        setNodeList([...nodeList, newNodeAddress]);
        setNodeNameList([...nodeNameList, newNodeName]);
        setSelectedNodeIndex(len);

        // Reset the input and close the dialog
        setNewNodeName("");
        setNewNodeAddress("");
        setIsDialogOpen(false);
    };

    const handleCancel = () => {
        setNewNodeAddress("");
        setIsDialogOpen(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const measureLatency = async (address: string, index: number) => {
        const start = performance.now(); // Start time
        try {
            await axios.get(`${address}/account/${wallet}/balance`, { timeout: 5000 }); // Replace with the appropriate endpoint
            const end = performance.now(); // End time
            const latency = end - start; // Calculate latency
            setNodes((prev) => {
                const newNodes = [...prev];
                newNodes[index].latency = latency;
                newNodes[index].status = "online";
                return newNodes;
            })
        } catch (error) {
            console.log(error);
            setNodes((prev) => {
                const newNodes = [...prev];
                newNodes[index].status = "offline"
                return newNodes;
            });
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (nodeList.length == 0) {
            console.log(`**** no supported nodes:`, nodeList.length);
        }
        else {
            // Initialize node statuses to "Checking"
            setNodes(nodeList.map((node, index) => ({
                id: index,
                name: nodeNameList[index], // Assign a name based on the index
                address: node, // Use the address from nodeList
                status: "Checking", // Initialize status as "Checking"
                latency: 0 // Initialize latency as 0
            })));
            if (isDialogOpen) {
                nodeList.forEach((node, index) => {
                    measureLatency(node, index); // Measure latency for each node
                });
                // Set up an interval to measure latency every 5 seconds (5000 ms)
                interval = setInterval(() => {
                    nodeList.forEach((node, index) => {
                        measureLatency(node, index); // Measure latency for each node
                    });
                }, 5000); // Adjust the interval as needed
            }
        }
        console.log("**** ", nodeList);

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
        
    }, [isDialogOpen, measureLatency, nodeList, nodeNameList, wallet])

    return (
        <div className="min-h-screen container relative px-4">
            <Header title="Select an Node" />
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
                {filteredNodes.length > 0 ? (
                    filteredNodes.map((node, index) => (
                        <NodeCard
                            key={index}
                            {...node}
                            setPrimaryNode={setPrimaryNode}
                            removeNode={removeNode}
                        />
                    ))
                ) : (
                    <div className="text-center text-white/50 mt-6">No nodes found</div>
                )}
            </div>
            <div className="absolute bottom-3 w-full left-0 px-4">
                <Button
                    variant="primary"
                    ariaLabel="Add Node"
                    onClick={() => setIsDialogOpen(true)}
                    className="w-full"
                >
                    + Add more nodes
                </Button>
            </div>
            {/* Popup Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-[#1A1A1A] p-4 rounded shadow-lg w-[300px]">
                        <h3 className="text-white text-xl font-semibold mb-4">Add new Node</h3>
                        <input
                            type="text"
                            placeholder="Node Name"
                            value={newNodeName}
                            onChange={(e) => setNewNodeName(e.target.value)}
                            className="w-full min-w-[150px] bg-[#2A2A2A] border border-primary/25 rounded-lg p-3 text-white focus:outline-none focus:border-primary mb-1"
                        />
                        <input
                            type="text"
                            placeholder="Node Address"
                            value={newNodeAddress}
                            onChange={(e) => setNewNodeAddress(e.target.value)}
                            className="w-full min-w-[150px] bg-[#2A2A2A] border border-primary/25 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                        />
                        {
                            warning && <p className="text-red-500 text-xs mt-1">Please enter a valid node address</p>
                        }
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
                                onClick={handleAddNode} // Add node
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

export default SelectNode;
