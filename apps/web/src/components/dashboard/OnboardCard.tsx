import { PlusIcon } from "@radix-ui/react-icons";

type Props = {
  onClick: () => void;
};

export default function OnboardCard({ onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-[#8B6914] hover:bg-[#F5F0E8]/50 transition-all cursor-pointer flex flex-col justify-center items-center min-h-[220px] text-center"
    >
      <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center mb-4 text-gray-500">
        <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM2 5L2.24647 10.9133C2.29656 12.1158 3.28637 13.0645 4.48972 13.0458C5.35246 13.0324 8.78446 12.979 9.1795 12.9734C10.3642 12.9565 11.3142 11.9687 11.3344 10.7836L11.5 10H14V11C14 11.5523 13.5523 12 13 12H12.639C12.3592 13.149 11.3168 14 10.0827 14C8.75677 14.0189 5.39414 14.071 4.50529 14.0848C2.80932 14.1111 1.41372 12.7744 1.34311 11.0792L1 2.84615V2.5C1 1.67157 1.67157 1 2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V3V5H2ZM3 6H10.45L10.3323 10.7225C10.3235 11.0741 10.0401 11.3533 9.68853 11.3527L4.47414 11.3444C4.12061 11.3439 3.83401 11.0607 3.82424 10.7072L3 6ZM10 1H5V2H10V1Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
        <PlusIcon className="w-4 h-4 ml-[-8px] mt-[-8px] bg-white rounded-full text-gray-800 border" />
      </div>
      <h3 className="font-outfit text-xl font-bold tracking-tight text-[#1A1A1A] mb-1">Onboard New Site</h3>
      <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400">Industrial Ledger V.4.0</p>
    </div>
  );
}
