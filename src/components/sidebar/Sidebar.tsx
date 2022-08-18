import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNotes } from "./SidebarNotes";
import cx from "classnames";

const sidebars = [
  {
    name: "Notes",
    jsxElem: <SidebarNotes key="Notes"></SidebarNotes>,
  },
  {
    name: "Hints",
    jsxElem: <div key="Hints">Hints</div>,
  },
  {
    name: "Bookmarks",
    jsxElem: <div key="Bookmarks">Bookmarks</div>,
  },
];

export const Sidebar = () => {
  const [activeSidebar, setActiveSidebar] = useState<string>(sidebars[0].name);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <aside
      className={cx(
        "h-full overflow-y-clip shadow-lg divide-y-[1px] divide-lightGrey transition-width duration-300",
        {
          "w-[40px] pt-4 px-1 overflow-hidden": !sidebarOpen,
          "w-[400px] p-4": sidebarOpen,
        }
      )}
    >
      <SidebarHeader
        setActiveSidebar={setActiveSidebar}
        setSidebarOpenForContent={setSidebarOpen}
      />
      {sidebars.map(
        (sidebar) =>
          sidebar.name === activeSidebar && sidebarOpen && sidebar.jsxElem
      )}
    </aside>
  );
};
