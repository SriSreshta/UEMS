import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MemoView } from "./StudentResults";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function VerifyMemoPage() {
  const [searchParams] = useSearchParams();
  const rollNumber = searchParams.get("rollNumber");
  const year = searchParams.get("year");
  const semester = searchParams.get("semester");

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        if (!rollNumber || !year || !semester) {
          throw new Error("Missing required query parameters to verify this memo.");
        }

        const res = await fetch(`https://uems-rz8o.onrender.com/api/public/verify-memo?rollNumber=${rollNumber}&year=${year}&semester=${semester}`);

        if (!res.ok) {
          throw new Error("Failed to verify memo. It may not exist, or the results have not been released.");
        }

        const data = await res.json();
        setResultsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationData();
  }, [rollNumber, year, semester]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-600">Verifying Digital Memo...</h2>
        </div>
      </div>
    );
  }

  if (error || !resultsData || !resultsData.semesters || resultsData.semesters.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg text-center border border-slate-100">
          <DocumentMagnifyingGlassIcon className="h-20 w-20 text-rose-300 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-800 mb-2">Verification Failed</h1>
          <p className="text-slate-500 font-medium">{error || "Could not retrieve the memo details."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col py-10 px-4 w-full">
      <div className="w-full max-w-[1000px] mx-auto text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-md">
          <DocumentMagnifyingGlassIcon className="h-5 w-5" />
          <span className="font-bold tracking-wide">Authentic UEMS Digital Record</span>
        </div>
      </div>

      <div className="w-full max-w-[1000px] mx-auto flex justify-center drop-shadow-2xl print:drop-shadow-none print:shadow-none bg-white rounded-lg p-2 sm:p-4">
        <MemoView
          resultsData={resultsData}
          sem={resultsData.semesters[0]}
          showCgpa={true}
          hideQr={true}
        />
      </div>

      <div className="w-full max-w-[1000px] mx-auto mt-6 text-center text-slate-400 text-xs font-semibold uppercase tracking-widest print:hidden">
        Powered by JNTUH Verification Protocol
      </div>
    </div>
  );
}
