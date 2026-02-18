const MedCostBreakdown = ({ totalCost, costPerParty }) => {
    // partyCount
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            Total Mediation Cost
                        </p>
                        <p className="text-lg font-bold">
                            BDT {parseFloat(totalCost || 0).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            Cost per Party
                        </p>
                        <p className="text-lg font-bold">
                            BDT {costPerParty.toFixed(2)}
                        </p>
                    </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                    <p>• All costs are divided equally among all parties</p>
                    <p>• Each party bears equal financial responsibility</p>
                    <p>
                        • Total cost includes all mediation fees and
                        administrative costs
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MedCostBreakdown;
