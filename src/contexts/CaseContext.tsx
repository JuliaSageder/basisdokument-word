import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  IEntry,
  IHighlightedEntry,
  ILitigiousCheck,
  IMetaData,
  IndividualEntrySortingEntry,
  UserRole,
} from "../types";
import { useSection } from "./SectionContext";
import { v4 as uuidv4 } from "uuid";
interface ICaseContext {
  caseId: string;
  setCaseId: Dispatch<SetStateAction<string>>;
  metaData: IMetaData;
  setMetaData: Dispatch<SetStateAction<IMetaData>>;
  litigiousChecks: ILitigiousCheck[];
  setLitigiousChecks: Dispatch<SetStateAction<ILitigiousCheck[]>>;
  entries: IEntry[];
  setEntries: Dispatch<SetStateAction<IEntry[]>>;
  groupedEntries: { [key: string]: { [key: string]: IEntry[] } };
  updateEntry: (entry: IEntry) => void;
  highlightedEntries: IHighlightedEntry[];
  setHighlightedEntries: Dispatch<SetStateAction<IHighlightedEntry[]>>;
  currentVersion: number;
  setCurrentVersion: Dispatch<SetStateAction<number>>;
  individualEntrySorting: IndividualEntrySortingEntry[];
  setIndividualEntrySorting: Dispatch<
    SetStateAction<IndividualEntrySortingEntry[]>
  >;
}

export const CaseContext = createContext<ICaseContext | null>(null);

interface CaseProviderProps {
  children: React.ReactNode;
}

/**
 * Groups entries by their respectve entry and parent id.
 * @param entries The entries to group.
 * @returns Object containing the grouped entries.
 */
export const groupEntriesBySectionAndParent = (entries: IEntry[]) => {
  const groupedEntries = entries.reduce((acc, entry) => {
    acc[entry.sectionId] ||= {};
    if (entry.associatedEntry) {
      acc[entry.sectionId][entry.associatedEntry] ||= [];
      acc[entry.sectionId][entry.associatedEntry].push(entry);
    } else {
      acc[entry.sectionId]["parent"] ||= [];
      acc[entry.sectionId]["parent"].push(entry);
    }
    return acc;
  }, {} as { [key: string]: { [key: string]: IEntry[] } });
  return groupedEntries;
};

export const getEntryById = (entries: IEntry[], id: string) => {
  return entries.find((entry) => entry.id === id);
};

export const CaseProvider: React.FC<CaseProviderProps> = ({ children }) => {
  const [entries, setEntries] = useState<IEntry[]>([]);
  const [caseId, setCaseId] = useState<string>("");
  const [metaData, setMetaData] = useState<IMetaData>({
    plaintiff: "",
    defendant: "",
  });
  const [litigiousChecks, setLitigiousChecks] = useState<ILitigiousCheck[]>([]);
  const [highlightedEntries, setHighlightedEntries] = useState<
    IHighlightedEntry[]
  >([]);
  const [groupedEntries, setGroupedEntries] = useState<{
    [key: string]: {
      [key: string]: IEntry[];
    };
  }>({});
  const [currentVersion, setCurrentVersion] = useState<number>(0);
  const [individualEntrySorting, setIndividualEntrySorting] = useState<
    IndividualEntrySortingEntry[]
  >([]);

  useEffect(() => {
    if (individualEntrySorting.length === 0 && entries.length > 0) {
      // set the initial sorting based on the entries with the following shape:
      //{sectionId: string, columns: {plaintiff: string[], defendant: string[]}}

      const initialSorting = entries.reduce((acc, entry) => {
        // if the accumulator array already contains a section with the sectionId, add the entryId to the respective column
        // else create a new entry with the sectionId and add the entryId to the respective column
        const newSection: IndividualEntrySortingEntry = {
          sectionId: entry.sectionId,
          rowId: uuidv4(),
          columns: [[], []],
        };
        if (entry.role === UserRole.Plaintiff) {
          newSection.columns[0].push(entry.id);
        } else {
          newSection.columns[1].push(entry.id);
        }
        acc.push(newSection);

        return acc;
      }, [] as IndividualEntrySortingEntry[]);
      setIndividualEntrySorting(initialSorting);
    }
  }, [entries, individualEntrySorting]);

  const { sectionList } = useSection();

  const updateEntry = (entry: IEntry) => {
    setEntries(entries.map((e) => (e.id === entry.id ? entry : e)));
  };

  useEffect(() => {
    setGroupedEntries(groupEntriesBySectionAndParent(entries));
  }, [entries, sectionList]);

  return (
    <CaseContext.Provider
      value={{
        caseId,
        setCaseId,
        currentVersion,
        setCurrentVersion,
        metaData,
        setMetaData,
        litigiousChecks,
        setLitigiousChecks,
        entries,
        setEntries,
        groupedEntries,
        updateEntry,
        highlightedEntries,
        setHighlightedEntries,
        individualEntrySorting,
        setIndividualEntrySorting,
      }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context = useContext(CaseContext);
  if (context === null) {
    throw new Error("useCase must be used within an CaseProvider");
  }
  return context;
};
