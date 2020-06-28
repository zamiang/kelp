import { Link, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
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
