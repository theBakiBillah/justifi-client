import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useMediationData = () => {
    const axiosPublic = useAxiosPublic();
    // All Mediations
    const { data: allMediations = [], refetch } = useQuery({
        queryKey: ["allMediations"],
        queryFn: async () => {
            const res = await axiosPublic.get("/all-mediations");
            return res.data;
        },
    });
    return {
        allMediations,
        refetchMediations: refetch,
    };
};

export default useMediationData;