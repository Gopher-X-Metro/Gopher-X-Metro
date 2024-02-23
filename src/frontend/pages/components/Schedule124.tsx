import React from 'react';

import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Heading,
  } from '@chakra-ui/react';

  export default function Schedule124(){
    return(
        <div>
            <Heading as='h1' size='md' margin = '5'>St. Paul Campus Circulator</Heading>
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
                    <Tr>
                        <Td>Monday-Friday</Td>
                        <Td>7:00 am – 6:00 pm</Td>
                        <Td>every 20 minutes</Td>
                    </Tr>
                   </Tbody>
                </Table>
            </TableContainer>
        </div>
    )
  }