import { useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";
import api from "../api/axios";

// Hooks & Utils
import { useAutosave } from "../hooks/useAutoSave";
import { toDateTimeLocal, toISO, formatIsoToTime, combineDateAndTime } from "../utils/dateFormatting";

// Components
import BackButton from "../components/common/BackButton";
import HeaderSection from "../components/pile-report/HeaderSection";
import ConcreteSection from "../components/pile-report/ConcreteSection";
import BoringTable from "../components/pile-report/BoringTable";
import ReinforcementTable from "../components/pile-report/ReinforcementTable";
import StatusBar from "../components/pile-report/StatusBar";

/**
 * Logic to sanitize form data before sending to API
 */
const cleanReportData = (data: any) => {
  const { id, status, isLocked, submittedAt, createdAt, updatedAt, ...rest } = data;
  const datePart = data.reportDate;

  return {
    ...rest,
    pourStartTime: toISO(data.pourStartTime),
    pourEndTime: toISO(data.pourEndTime),
    boringLogs: (data.boringLogs || []).map(({ id, ...log }: any) => ({
      ...log,
      fromTime: combineDateAndTime(datePart, log.fromTime),
      toTime: combineDateAndTime(datePart, log.toTime),
      depth: parseFloat(log.depth) || 0,
    })),
    reinforcementEntries: (data.reinforcementEntries || []).map(({ id, ...entry }: any) => ({
      ...entry,
      barDiameter: parseFloat(entry.barDiameter) || 0,
      length: parseFloat(entry.length) || 0,
      totalLengthRmt: parseFloat(entry.totalLengthRmt) || 0,
      weightPerRmt: parseFloat(entry.weightPerRmt) || 0,
      totalWeight: parseFloat(entry.totalWeight) || 0,
    })),
  };
};

export default function PileReportPage() {
  const { pileId, siteId } = useParams();

  const methods = useForm({
    defaultValues: {
      reportDate: "",
      concreteGrade: "",
      theoreticalQuantity: "",
      actualQuantity: "",
      tremieLength: "",
      pourStartTime: "",
      pourEndTime: "",
      rmcSupplierName: "",
      isLocked: false,
      boringLogs: [],
      reinforcementEntries: [],
    },
  });

  const { reset, watch, formState: { isDirty } } = methods;

  // 1. Fetch and format initial data
  useEffect(() => {
    api.get(`/piles/${pileId}/report`).then((res) => {
      const raw = res.data;
      reset({
        ...raw,
        pourStartTime: toDateTimeLocal(raw.pourStartTime),
        pourEndTime: toDateTimeLocal(raw.pourEndTime),
        boringLogs: (raw.boringLogs || []).map((log: any) => ({
          ...log,
          fromTime: formatIsoToTime(log.fromTime),
          toTime: formatIsoToTime(log.toTime),
        })),
      });
    });
  }, [pileId, reset]);

  // 2. Watch and Memoize cleaned data for Autosave
  const formData = watch();
  const memoizedData = useMemo(() => cleanReportData(formData), [JSON.stringify(formData)]);

  // 3. Initialize Autosave
  const { status } = useAutosave(
    `/piles/${pileId}/report`,
    "patch",
    memoizedData,
    !!pileId && isDirty && !formData.isLocked,
    2000
  );

  return (
    <FormProvider {...methods}>
      <form className="space-y-8 p-8" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between">
          <BackButton to={`/dashboard/site/${siteId}/piles`} />

          <div className="text-sm font-medium">
            {status === "saving" && <span className="text-blue-500 animate-pulse">Saving changes...</span>}
            {status === "saved" && <span className="text-green-600">All changes saved</span>}
            {status === "error" && <span className="text-red-500">Error saving!</span>}
          </div>
        </div>

        <HeaderSection />
        <ConcreteSection />
        <BoringTable />
        <ReinforcementTable />
        <StatusBar status={status} isLocked={formData.isLocked} />
      </form>
    </FormProvider>
  );
}