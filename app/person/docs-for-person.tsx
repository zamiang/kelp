import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { formatRelative } from 'date-fns';
import React from 'react';
import { IProps } from '../dashboard';
import { IPerson } from '../store/person-store';

interface IPersonProps extends IProps {
  person: IPerson;
}

const DocsForPerson = (props: IPersonProps) => {
  const person = props.person;
  const rows = person.driveActivityIds.map((id) => props.driveActivityStore.getById(id));
  return (
    <React.Fragment>
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

export default DocsForPerson;
