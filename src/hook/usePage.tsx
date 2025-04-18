import { usePageContext } from "src/hook/PageContext";

export default function usePage(): [string, React.Dispatch<React.SetStateAction<string>>] {
    const { page, setPage } = usePageContext();

    return [page, setPage];
}