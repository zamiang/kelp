import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import clsx from 'clsx';
import { uniq } from 'lodash';
import React from 'react';
import { useAsync } from 'react-async-hook';
import { styles } from './app';
import Emails from './emails';

interface IProps {
  isOpen: boolean;
  classes: styles;
  handleDrawerClose: () => void;
  people: string[];
}

const lookupPeople = async (people: string[]) => {
  if (people.length > 0) {
    return await gapi.client.people.people.getBatchGet({
      personFields: 'names,nicknames,emailAddresses,photos',
      resourceNames: uniq(people),
    });
  }
  return Promise.resolve();
};

/*
// for reference
const foo = {
  httpStatusCode: 200,
  person: {
    resourceName: 'people/100884430802346698066',
    etag: '%EgkBAj0DCT4KNy4aBAECBQciDFpEWE1ZTm1NRlYwPQ==',
    names: [
      {
        metadata: { primary: true, source: { type: 'PROFILE', id: '100884430802346698066' } },
        displayName: 'Brennan Moore',
        familyName: 'Moore',
        givenName: 'Brennan',
        displayNameLastFirst: 'Moore, Brennan',
      },
      {
        metadata: { source: { type: 'CONTACT', id: '147f27bb972bac20' } },
        displayName: 'Brennan Moore',
        familyName: 'Moore',
        givenName: 'Brennan',
        displayNameLastFirst: 'Moore, Brennan',
      },
    ],
    photos: [
      {
        metadata: { primary: true, source: { type: 'PROFILE', id: '100884430802346698066' } },
        url:
          'https://lh3.googleusercontent.com/a-/AOh14GjBtaHxjkknpCtJIUVD_Xr8NBSq4mHTlbXAT7Mtjg=s100',
      },
      {
        metadata: { source: { type: 'CONTACT', id: '147f27bb972bac20' } },
        url:
          'https://lh4.googleusercontent.com/-6rgj7feIGXU/XgZo3wMu_dI/AAAAAAAAAAA/Rtn5hFuVRW0kf8qyRZ3nPQN1GRo_KzwWwCOQCEAE/s100/photo.jpg',
      },
      {
        metadata: { source: { type: 'CONTACT', id: '10d1e2079499e43e' } },
        url: 'https://lh3.googleusercontent.com/a/default-user=s100',
        default: true,
      },
    ],
    emailAddresses: [
      {
        metadata: {
          primary: true,
          verified: true,
          source: { type: 'ACCOUNT', id: '100884430802346698066' },
        },
        value: 'Brennanmoore@gmail.com',
      },
      {
        metadata: { verified: true, source: { type: 'PROFILE', id: '100884430802346698066' } },
        value: 'brennanmoore@gmail.com',
        type: 'home',
        formattedType: 'Home',
      },
      {
        metadata: { source: { type: 'CONTACT', id: '147f27bb972bac20' } },
        value: 'brennanmoore@gmail.com',
        type: 'other',
        formattedType: 'Other',
      },
    ],
  },
  requestedResourceName: 'people/100884430802346698066',
  status: {},
};
*/

const LeftDrawer = (props: IProps) => {
  const peopleResponse = useAsync(() => lookupPeople(props.people), props.people);
  const formattedPeople =
    peopleResponse.result &&
    peopleResponse.result.result.responses &&
    peopleResponse.result.result.responses.map((person) => ({
      id: person.requestedResourceName || 'unknown',
      name:
        person.person && person.person.names && person.person.names[0].displayName
          ? person.person.names[0].displayName
          : 'unknown',

      email:
        person.person &&
        person.person.emailAddresses &&
        person.person.emailAddresses[0] &&
        person.person.emailAddresses[0].value
          ? person.person.emailAddresses[0].value
          : 'unknown',
    }));

  const peopleHtml = (formattedPeople || []).map((person) => (
    <React.Fragment key={person.id}>
      <Divider />
      <List>{person.name}</List>
    </React.Fragment>
  ));

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(props.classes.drawerPaper, !props.isOpen && props.classes.drawerPaperClose),
      }}
      open={props.isOpen}
    >
      <div className={props.classes.toolbarIcon}>
        <IconButton onClick={props.handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      {peopleHtml}
      {formattedPeople && formattedPeople.length > 0 && <Emails people={formattedPeople} />}
    </Drawer>
  );
};

export default LeftDrawer;
