import NewFolderIcon from "~/components/svg/NewFolderIcon.vue";
import UploadDocumentIcon from "~/components/svg/UploadDocumentIcon.vue";
import PasteIcon from "~/components/svg/PasteIcon.vue";
import SelectAllIcon from "~/components/svg/SelectAllIcon.vue";
import RefreshIcon from "~/components/svg/RefreshIcon.vue";
import EyeSlashIcon from "~/components/svg/EyeSlashIcon.vue";
import OpenIcon from "~/components/svg/OpenIcon.vue";
import RenameIcon from "~/components/svg/RenameIcon.vue";
import CopyIcon from "~/components/svg/CopyIcon.vue";
import DeleteIcon from "~/components/svg/DeleteIcon.vue";
import DownloadIcon from "~/components/svg/DownloadIcon.vue";

const generalMenuOptions: ContextMenuEntry[] = [
    {
        icon: NewFolderIcon,
        text: "New folder",
        hotkey: "Ctrl + Alt + N",
    },
    {
        icon: UploadDocumentIcon,
        text: "Upload document",
        hotkey: "Ctrl + Alt + Shift + N"
    },
    {
        icon: PasteIcon,
        text: "Paste",
        hotkey: "Ctrl + V",
        divided: true
    },
    {
        icon: SelectAllIcon,
        text: "Select all",
        hotkey: "Ctrl + A",
    },
    {
        icon: RefreshIcon,
        text: "Refresh",
        divided: true
    },
    {
        icon: EyeSlashIcon,
        text: "Show/Hide all folders",
        hotkey: "Ctrl + Alt + H"
    }
]

const fileMenuOptions: ContextMenuEntry[] = [
    {
        icon: OpenIcon,
        text: "Open in new tab",
    },
    {
        icon: RenameIcon,
        text: "Rename",
        divided: true
    },
    {
        icon: CopyIcon,
        text: "Copy",
    },
    {
        icon: DeleteIcon,
        text: "Delete"
    },
    {
        icon: DownloadIcon,
        text: "Download",
        divided: true
    }
]

const folderMenuOptions: ContextMenuEntry[] = [
    {
        icon: OpenIcon,
        text: "Open in new tab",
    },
    {
        icon: RenameIcon,
        text: "Rename",
        divided: true
    },
    {
        icon: CopyIcon,
        text: "Copy",
    },
    {
        icon: DeleteIcon,
        text: "Delete"
    }
]

export default function useContextMenu() {
    return {
        generalMenuOptions,
        fileMenuOptions,
        folderMenuOptions
    }
}