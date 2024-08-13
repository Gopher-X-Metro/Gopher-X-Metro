import React, { useEffect } from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Heading,
} from '@chakra-ui/react';
import { useSidebar } from './SidebarContext'; 

export default function Schedule({ selectedName, scheduleTimes }) {
    const { setSidebarOpen } = useSidebar(); // checks sidebar state

    // Close the sidebar when this component is rendered
    useEffect(() => {
        setSidebarOpen(false);
    }, [setSidebarOpen]);

    const renderRows = (scheduleTimes) => {
        return scheduleTimes.map((row, index) => {
            return (
                <Tr key={"table-row-" + index}>
                    <Td>{row[0]}</Td>
                    <Td>{row[1]}</Td>
                    <Td>{row[2]}</Td>
                </Tr>
            );
        });
    };

    return (
        <div>
            <Heading as='h1' size='md' margin='5'>{selectedName}</Heading>
            <TableContainer>
                <Table variant='striped'>
                    <TableCaption>Only for Fall/Spring Semesters and Finals</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Days</Th>
                            <Th>Times</Th>
                            <Th>Frequency</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {renderRows(scheduleTimes)}
                    </Tbody>
                </Table>
            </TableContainer>
        </div>
    );
}
