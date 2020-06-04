import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { formatRelative } from 'date-fns';
import React from 'react';
import { UseAsyncReturn } from 'react-async-hook';

interface IProps {
  docs: UseAsyncReturn<gapi.client.drive.File[], string[]>;
}

const Docs = (props: IProps) => (
  <React.Fragment>
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      Recent Google Docs
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Starred</TableCell>
          <TableCell align="right">Link</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(props.docs.result || []).map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              {row.modifiedTime && formatRelative(new Date(row.modifiedTime), new Date())}
            </TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.starred}</TableCell>
            <TableCell align="right">
              <Link href={row.webViewLink}>Link</Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </React.Fragment>
);

export default Docs;
