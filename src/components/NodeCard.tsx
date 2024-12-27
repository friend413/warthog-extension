import { IoMdTrash } from "react-icons/io";
import useWallet from "../hooks/useWallet";

const NodeCard = ({
    id,
    name,
    address,
    status,
    latency,
    setPrimaryNode,
    removeNode,
}: {
    id: number;
    name: string;
    address: string;
    status: string;
    latency: number;
    setPrimaryNode: (id: number) => void;
    removeNode: (id: number) => void;
}) => {
    const { selectedNodeIndex } = useWallet();

    return (
        <>
            <div className={`px-2 flex justify-between items-center w-full mt-6 relative border-l-2 cursor-pointer border-[curentColor] hover:bg-orange-400 ${selectedNodeIndex === id ? 'bg-[currentColor]' : ''}`} onClick={() => setPrimaryNode(id)}>
                <div className="items-center gap-4 cursor-pointer">
                    {/* <img
                        className="w-12 h-12 rounded-full object-cover"
                        src="profile-image.png"
                        alt={`${name} Profile`}
                    /> */}
                    <div>
                        <div className="text-white text-xl font-semibold">{name}</div>
                        <div className="text-white/50 text-xs">{address}</div>
                    </div>
                </div>
                <div className="items-center gap-3 cursor-pointer">
                    <div className="flex flex-col items-end hidden">
                        <div className="text-white text-xl font-medium">{status}</div>
                        <div className="text-white/50 text-lg">${latency}</div>
                    </div>
                    <IoMdTrash onClick={() => removeNode(id)} className="w-6 h-6 cursor-pointer z-10 text-white" />
                </div>
                {/* <div className="flex items-center gap-3">
                    <IoMdTrash />
                </div> */}
            </div>
        </>
    );
};

export default NodeCard;
