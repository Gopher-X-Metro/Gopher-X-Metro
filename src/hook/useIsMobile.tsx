import { useMediaQuery } from "@chakra-ui/react";

export default function useIsMobile(): boolean {
    const [isMobile] = useMediaQuery("(max-width: 1024px)");

    return isMobile;
}