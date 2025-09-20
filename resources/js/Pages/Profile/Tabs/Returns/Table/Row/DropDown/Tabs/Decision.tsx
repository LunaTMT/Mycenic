// Tabs/Decision.tsx

type DecisionProps = { returnData: any };

export default function Decision({ returnData }: DecisionProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Return Status:</span>
        <span>{returnData.status}</span>
      </div>
      <div className="flex justify-between">
        <span>Approved:</span>
        <span>{returnData.approved ? "Yes" : "No"}</span>
      </div>
      {returnData.completed_at && (
        <div className="flex justify-between">
          <span>Completed At:</span>
          <span>{new Date(returnData.completed_at).toLocaleDateString("en-GB")}</span>
        </div>
      )}
    </div>
  );
}
