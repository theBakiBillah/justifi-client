import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

export const useArbData = () => {
    const axiosPublic = useAxiosPublic();

    // All Arbitrations
    const { data: allArbitrations = [], refetch } = useQuery({
        queryKey: ["allArbitrations"],
        queryFn: async () => {
            const res = await axiosPublic.get("/all-arbitrations");
            return res.data;
        },
    });

    return {
        allArbitrations,
        refetchArbitrations: refetch,
    };
};

export default useArbData;
