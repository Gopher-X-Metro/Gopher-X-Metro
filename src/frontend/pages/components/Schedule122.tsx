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

  export default function Schedule122(){
    return(
        <div>
        <Heading as='h1' size='md' margin = '5'>122 University Avenue Circulator</Heading>
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
                        <Td>7:00 am – 6:30 pm</Td>
                        <Td>every 10 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Monday-Wednesday</Td>
                        <Td>6:30 pm – 12:15 am</Td>
                        <Td>every 15 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Thursday-Friday</Td>
                        <Td>6:30 pm – 2:00 am</Td>
                        <Td>every 15 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Saturday</Td>
                        <Td>9:30 am – 2:00 am</Td>
                        <Td>every 15 minutes</Td>
                    </Tr>
                    <Tr>
                        <Td>Sunday</Td>
                        <Td>9:30 am – 12:15 am</Td>
                        <Td>every 15 minutes</Td>
                    </Tr>
                    </Tbody>
                </Table>
            </TableContainer>
        </div>
    )
  }