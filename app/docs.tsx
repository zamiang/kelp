import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { formatRelative } from 'date-fns';
import React from 'react';
import { IProps } from './dashboard';
import Title from './title';

interface IPersonProps extends IProps {
  personEmail: string;
}

const Docs = (props: IPersonProps) => {
  const person = props.personDataStore.getPersonByEmail(props.personEmail);
  const rows = person.driveActivity;
  return (
    <React.Fragment>
      <Title>Recent Google Docs</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Name</TableCell>
            <TableCell align="right">Link</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{formatRelative(row.time, new Date())}</TableCell>
              <TableCell>{row.title}</TableCell>
              <TableCell align="right">
                <Link href={row.link || ''}>Link</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
};

export default Docs;
