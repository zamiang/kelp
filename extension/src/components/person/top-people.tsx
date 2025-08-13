import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getWeek } from 'date-fns';
import { countBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IPerson } from '../store/data-types';
import { IStore } from '../store/use-store';
import { MostRecentTab } from '../website/most-recent-tab';
import Link from '@mui/material/Link';
import KelpIcon from '../../../../public/kelp-24.svg';
import '../../styles/components/person/top-people.css';

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
    <div className="top-people">
      <Grid container spacing={2} className="top-people__container" alignItems="center">
        <Grid className="top-people__kelp-icon">
          <Link href="https://www.kelp.nyc" className="top-people__logo">
            <KelpIcon height="24" width="24" className="top-people__icon-selected" />
          </Link>
        </Grid>
        <Grid>
          <MostRecentTab />
        </Grid>
        {people.map((person) => (
          <Grid key={person.id}>
            <div className="top-people__person">
              <div
                className="top-people__image-container"
                onClick={() => navigate(`/people/${encodeURIComponent(person.id)}`)}
              >
                {person.imageUrl ? (
                  <Avatar
                    alt={`Profile photo for ${
                      person.name || person.emailAddresses[0] || undefined
                    }`}
                    className="top-people__avatar"
                    src={person.imageUrl}
                  />
                ) : (
                  <Avatar
                    alt={person.name || person.emailAddresses[0] || undefined}
                    className="top-people__avatar"
                  >
                    {(person.name || person.id)[0]}
                  </Avatar>
                )}
              </div>
              <div
                className="top-people__text-container"
                onClick={() => navigate(`/people/${encodeURIComponent(person.id)}`)}
              >
                <Typography noWrap variant="body2" className="top-people__text">
                  {person.name}
                </Typography>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};
