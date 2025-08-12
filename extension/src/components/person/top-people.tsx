import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { getWeek } from 'date-fns';
import { countBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IPerson } from '../store/data-types';
import { IStore } from '../store/use-store';
import { MostRecentTab } from '../website/most-recent-tab';
import Link from '@mui/material/Link';
import KelpIcon from '../../../../public/kelp-24.svg';

const PREFIX = 'TopPeople';

const classes = {
  person: `${PREFIX}-person`,
  container: `${PREFIX}-container`,
  avatar: `${PREFIX}-avatar`,
  item: `${PREFIX}-item`,
  text: `${PREFIX}-text`,
  logo: `${PREFIX}-logo`,
  icon: `${PREFIX}-icon`,
  textContainer: `${PREFIX}-textContainer`,
  imageContainer: `${PREFIX}-imageContainer`,
  iconImage: `${PREFIX}-iconImage`,
  iconSelected: `${PREFIX}-iconSelected`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.person}`]: {
    opacity: 1,
    transition: 'opacity 0.3s',
    cursor: 'pointer',
    display: 'flex',
    '&:hover': { opacity: 0.7 },
  },
  [`& .${classes.container}`]: {
    height: 38,
    overflow: 'hidden',
  },
  [`& .${classes.item}`]: {},
  [`& .${classes.avatar}`]: {
    height: 20,
    width: 20,
  },
  [`& .${classes.text}`]: { color: theme.palette.text.primary },
  [`& .${classes.icon}`]: {
    display: 'inline-block',
    verticalAlign: 'top',
    marginLeft: theme.spacing(1),
    opacity: 0.6,
    marginTop: 1,
  },
  [`& .${classes.imageContainer}`]: {
    marginRight: theme.spacing(1),
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: 1,
  },
  [`& .${classes.textContainer}`]: {
    display: 'inline-block',
    verticalAlign: 'top',
    maxWidth: 140,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  [`& .${classes.logo}`]: {
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.5,
    },
  },
  [`& .${classes.iconImage}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.iconSelected}`]: {
    color: theme.palette.primary.main,
  },
}));

export const TopPeople = (props: { store: IStore }) => {
  const [people, setTopPeople] = useState<IPerson[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const currentWeek = getWeek(new Date());
      const nextWeek = getWeek(new Date());

      const segments = (await props.store.timeDataStore.getAll()).filter((s) => {
        const w = getWeek(s.start);
        return w === currentWeek || w === nextWeek;
      });
      const emails: string[] = [];
      segments.forEach((s) => s.attendees.forEach((a) => a.email && emails.push(a.email)));
      const counts = countBy(emails);
      const sortedEmails = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      const people = await Promise.all(
        sortedEmails.map(async (e) => props.store.personDataStore.getByEmail(e)),
      );
      setTopPeople(people.filter((p) => !p.isCurrentUser).slice(0, 5));
    };
    void fetchData();
  }, [props.store.isLoading]);

  return (
    <Root>
      <Grid container spacing={2} className={classes.container} alignItems="center">
        <Grid style={{ height: 24, marginRight: 8 }}>
          <Link href="https://www.kelp.nyc" className={classes.logo}>
            <KelpIcon height="24" width="24" className={classes.iconSelected} />
          </Link>
        </Grid>
        <Grid>
          <MostRecentTab />
        </Grid>
        {people.map((person) => (
          <Grid key={person.id}>
            <div className={classes.person}>
              <div
                className={classes.imageContainer}
                onClick={() => navigate(`/people/${encodeURIComponent(person.id)}`)}
              >
                {person.imageUrl ? (
                  <Avatar
                    alt={`Profile photo for ${
                      person.name || person.emailAddresses[0] || undefined
                    }`}
                    className={classes.avatar}
                    src={person.imageUrl}
                  />
                ) : (
                  <Avatar
                    alt={person.name || person.emailAddresses[0] || undefined}
                    className={classes.avatar}
                  >
                    {(person.name || person.id)[0]}
                  </Avatar>
                )}
              </div>
              <div
                className={classes.textContainer}
                onClick={() => navigate(`/people/${encodeURIComponent(person.id)}`)}
              >
                <Typography noWrap variant="body2" className={classes.text}>
                  {person.name}
                </Typography>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    </Root>
  );
};
