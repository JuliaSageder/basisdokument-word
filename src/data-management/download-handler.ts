import { saveAs } from "file-saver";
import {
  IBookmark,
  IEntry,
  IHighlightedEntry,
  IHighlighter,
  IHint,
  ILitigiousCheck,
  IMetaData,
  INote,
  ISection,
  IVersion,
} from "../types";
import { jsPDF } from "jspdf";
import { groupEntriesBySectionAndParent } from "../contexts/CaseContext";

function downloadObjectAsJSON(obj: object, fileName: string) {
  // Create a blob of the data
  var fileToSave = new Blob([JSON.stringify(obj)], {
    type: "application/json",
  });

  // Save the file
  saveAs(fileToSave, fileName);
}

function downloadBasisdokumentAsPDF(obj: any, fileName: string) {
  let pdfConverter = jsPDF,
    doc = new pdfConverter();

  doc.setFont("Comic Sans");

  let basisdokumentDOMRepresentation = document.createElement("div");
  basisdokumentDOMRepresentation.style.padding = "10px";
  basisdokumentDOMRepresentation.style.display = "flex";
  basisdokumentDOMRepresentation.style.flexDirection = "column";
  basisdokumentDOMRepresentation.style.width = "210px";

  // Main Title "Basisdokument"
  let mainTitleEl = document.createElement("h1");
  mainTitleEl.style.fontSize = "5px";
  mainTitleEl.style.fontWeight = "bold";
  mainTitleEl.innerHTML = "Basisdokument";
  basisdokumentDOMRepresentation.appendChild(mainTitleEl);

  // Case Id
  let caseIdEl = document.createElement("span");
  caseIdEl.innerHTML = "Aktenzeichen " + obj["caseId"];
  caseIdEl.style.fontSize = "3px";
  basisdokumentDOMRepresentation.appendChild(caseIdEl);

  // Version
  let versionEl = document.createElement("span");
  versionEl.innerHTML = "Version " + obj["currentVersion"];
  versionEl.style.fontSize = "3px";
  basisdokumentDOMRepresentation.appendChild(versionEl);

  // Export Timestamp
  let timestampEl = document.createElement("span");
  timestampEl.innerHTML =
    "Exportiert am " +
    obj["versions"][obj["versions"].length - 1]["timestamp"].toLocaleString();
  timestampEl.style.fontSize = "3px";
  basisdokumentDOMRepresentation.appendChild(timestampEl);

  // Metadaten Plaintiff
  let metaPlaintiffTitleEl = document.createElement("span");
  metaPlaintiffTitleEl.innerHTML = "Metadaten Klagepartei";
  metaPlaintiffTitleEl.style.fontSize = "5px";
  metaPlaintiffTitleEl.style.fontWeight = "bold";
  metaPlaintiffTitleEl.style.marginTop = "5px";
  basisdokumentDOMRepresentation.appendChild(metaPlaintiffTitleEl);
  let metaPlaintiffTextEl = document.createElement("span");
  if (obj["metaData"]) {
    metaPlaintiffTextEl.innerHTML = obj["metaData"]["plaintiff"];
  }
  metaPlaintiffTextEl.style.fontSize = "3px";
  metaPlaintiffTextEl.style.marginTop = "10px";
  basisdokumentDOMRepresentation.appendChild(metaPlaintiffTextEl);

  // Metadaten Defendant
  let metaDefendantTitleEl = document.createElement("span");
  metaDefendantTitleEl.innerHTML = "Metadaten Beklagtenpartei";
  metaDefendantTitleEl.style.fontSize = "5px";
  metaDefendantTitleEl.style.fontWeight = "bold";
  metaDefendantTitleEl.style.marginTop = "5px";
  basisdokumentDOMRepresentation.appendChild(metaDefendantTitleEl);
  let metaDefendantTextEl = document.createElement("span");
  if (obj["metaData"]) {
    metaDefendantTextEl.innerHTML = obj["metaData"]["defendant"];
  }
  metaDefendantTextEl.style.fontSize = "3px";
  metaDefendantTextEl.style.marginTop = "10px";
  basisdokumentDOMRepresentation.appendChild(metaDefendantTextEl);

  // Hinweise des Richters nach §139 ZPO
  let hintsTitleEl = document.createElement("span");
  hintsTitleEl.innerHTML = "Hinweise des Richters nach (nach §139 ZPO)";
  hintsTitleEl.style.fontSize = "5px";
  hintsTitleEl.style.fontWeight = "bold";
  hintsTitleEl.style.marginTop = "4px";
  basisdokumentDOMRepresentation.appendChild(hintsTitleEl);

  for (let index = 0; index < obj["judgeHints"].length; index++) {
    const judgeHintObject = obj["judgeHints"][index];
    let judgeHintTitleEl = document.createElement("span");
    let entryCode = obj["entries"].find((entry: any) => {
      return entry.id === judgeHintObject.associatedEntry;
    }).entryCode;

    judgeHintTitleEl.innerHTML =
      judgeHintObject.author +
      " | Verweis auf: " +
      entryCode +
      " | " +
      judgeHintObject.title;
    judgeHintTitleEl.style.fontSize = "3px";
    judgeHintTitleEl.style.fontWeight = "bold";
    judgeHintTitleEl.style.marginTop = "4px";
    let judgeHintTextEl = document.createElement("span");
    judgeHintTextEl.innerHTML = judgeHintObject.text;
    judgeHintTextEl.style.fontSize = "3px";
    basisdokumentDOMRepresentation.appendChild(judgeHintTitleEl);
    basisdokumentDOMRepresentation.appendChild(judgeHintTextEl);
  }

  // Discussion Title
  let discussionTitleEl = document.createElement("span");
  discussionTitleEl.innerHTML = "Parteivortrag";
  discussionTitleEl.style.fontSize = "5px";
  discussionTitleEl.style.fontWeight = "bold";
  discussionTitleEl.style.marginTop = "4px";
  basisdokumentDOMRepresentation.appendChild(discussionTitleEl);

  // Get grouped entries
  let groupedEntries = groupEntriesBySectionAndParent(obj["entries"]);

  for (let i = 0; i < obj["sections"].length; i++) {
    // Gliederungspunkt Nummer
    let letSectionTitleEl = document.createElement("span");
    letSectionTitleEl.innerHTML = `${i + 1}. Gliederungspunkt`;
    letSectionTitleEl.style.fontSize = "4px";
    letSectionTitleEl.style.fontWeight = "bold";
    letSectionTitleEl.style.marginTop = "4px";
    basisdokumentDOMRepresentation.appendChild(letSectionTitleEl);

    // section title plaintiff
    let letSectionTitlePlaintiffEl = document.createElement("span");
    letSectionTitlePlaintiffEl.innerHTML =
      "Titel Klagepartei: " + obj["sections"][i].titlePlaintiff;
    letSectionTitlePlaintiffEl.style.fontSize = "3px";
    letSectionTitlePlaintiffEl.style.color = "gray";
    basisdokumentDOMRepresentation.appendChild(letSectionTitlePlaintiffEl);

    // section title defendant
    let letSectionTitleDefendantEl = document.createElement("span");
    letSectionTitleDefendantEl.innerHTML =
      "Titel Beklagtenpartei: " + obj["sections"][i].titleDefendant;
    letSectionTitleDefendantEl.style.fontSize = "3px";
    letSectionTitleDefendantEl.style.color = "gray";
    basisdokumentDOMRepresentation.appendChild(letSectionTitleDefendantEl);

    // get section entries
    let sectionEntriesParent = groupedEntries[obj["sections"][i].id].parent;
    for (let entryId = 0; entryId < sectionEntriesParent.length; entryId++) {
      const entry = sectionEntriesParent[entryId];

      let entryTitleEl = document.createElement("span");
      entryTitleEl.innerHTML = entry.entryCode + " | " + entry.author;
      entryTitleEl.style.fontSize = "3px";
      entryTitleEl.style.fontWeight = "bold";
      entryTitleEl.style.marginTop = "5px";
      basisdokumentDOMRepresentation.appendChild(entryTitleEl);

      let entryTextEl = document.createElement("span");
      entryTextEl.innerHTML = entry.text;
      entryTextEl.style.fontSize = "3px";
      basisdokumentDOMRepresentation.appendChild(entryTextEl);

      // get child entries of an entry
      if (groupedEntries[obj["sections"][i].id][entry.id]) {
        for (
          let childEntryIndex = 0;
          childEntryIndex <
          groupedEntries[obj["sections"][i].id][entry.id].length;
          childEntryIndex++
        ) {
          let childEntry =
            groupedEntries[obj["sections"][i].id][entry.id][childEntryIndex];

          let childEntryTitleEl = document.createElement("span");
          childEntryTitleEl.innerHTML =
            childEntry.entryCode + " | " + childEntry.author;
          childEntryTitleEl.style.fontSize = "3px";
          childEntryTitleEl.style.fontWeight = "bold";
          childEntryTitleEl.style.marginTop = "5px";
          childEntryTitleEl.style.marginLeft = "5px";
          basisdokumentDOMRepresentation.appendChild(childEntryTitleEl);

          let childEntryTextEl = document.createElement("span");
          childEntryTextEl.innerHTML = childEntry.text;
          childEntryTextEl.style.fontSize = "3px";
          childEntryTextEl.style.marginLeft = "5px";
          basisdokumentDOMRepresentation.appendChild(childEntryTextEl);
        }
      }
    }
  }

  let stringHtml = basisdokumentDOMRepresentation.outerHTML;
  doc.html(stringHtml).then(() => doc.save(fileName));
}

export function downloadBasisdokument(
  caseId: string,
  currentVersion: number,
  versionHistory: IVersion[],
  metaData: IMetaData | null,
  entries: IEntry[],
  sectionList: ISection[],
  hints: IHint[],
  litigiousChecks: ILitigiousCheck[]
) {
  let basisdokumentObject: any = {};
  basisdokumentObject["caseId"] = caseId;
  basisdokumentObject["fileType"] = "basisdokument";
  basisdokumentObject["currentVersion"] = currentVersion;
  basisdokumentObject["versions"] = versionHistory;
  basisdokumentObject["versions"][basisdokumentObject["versions"].length - 1][
    "timestamp"
  ] = new Date() /*.toLocaleString("de-DE", {timeZone: "Europe/Berlin"})*/;
  basisdokumentObject["metaData"] = metaData;
  basisdokumentObject["entries"] = entries;
  basisdokumentObject["sections"] = sectionList;
  basisdokumentObject["judgeHints"] = hints;
  basisdokumentObject["litigiousChecks"] = litigiousChecks;
  // downloadObjectAsJSON(
  //   basisdokumentObject,
  //   "basisdokument_version_" + currentVersion + "_case_" + currentVersion
  // );
  downloadBasisdokumentAsPDF(
    basisdokumentObject,
    "basisdokument_version_" + currentVersion + "_case_" + currentVersion
  );
}

export function downloadEditFile(
  caseId: string,
  currentVersion: number,
  highlightedEntries: IHighlightedEntry[],
  colorSelection: IHighlighter[],
  notes: INote[],
  bookmarks: IBookmark[],
  individualSorting: string[]
) {
  let editFileObject: any = {};
  editFileObject["caseId"] = caseId;
  editFileObject["fileType"] = "editFile";
  editFileObject["currentVersion"] = currentVersion;
  editFileObject["highlightedEntries"] = highlightedEntries;
  editFileObject["highlighter"] = colorSelection;
  editFileObject["notes"] = notes;
  editFileObject["bookmarks"] = bookmarks;
  editFileObject["individualSorting"] = individualSorting;
  // downloadObjectAsJSON(
  //   editFileObject,
  //   "bearbeitungsdatei_version_" + currentVersion + "_case_" + currentVersion
  // );
}
