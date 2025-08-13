import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../../constants/config';
import HelpIcon from '../../../../public/icons/help.svg';
import SearchIcon from '../../../../public/icons/search.svg';
import { IDocument, ISegment, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';
import '../../styles/components/documents/document-row.css';

export const MissingDocumentRow = (props: {
  segmentDocument: ISegmentDocument;
  store: IStore;
  isSmall?: boolean;
}) => {
  const [meeting, setMeeting] = useState<ISegment | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.segmentId) {
        const result = await props.store.timeDataStore.getById(props.segmentDocument.segmentId);
        setMeeting(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.segmentId, props.store.isLoading]);

  return (
    <div
      className={clsx(
        'document-row-root',
        !props.isSmall && 'document-row',
        props.isSmall && 'document-row-small',
      )}
      onClick={() => {
        // TODO handle slides?
        window.open(
          `https://docs.google.com/document/d/${props.segmentDocument.documentId}`,
          '_blank',
        );
      }}
    >
      <Box display="flex" alignItems="center">
        <Box className="document-row-left">
          <IconButton size="small">
            <HelpIcon
              height="18"
              width="18"
              className={clsx(
                'document-row-image',
                props.isSmall && 'document-row-image-spacing',
                'u-margin-auto',
              )}
            />
          </IconButton>
        </Box>
        <Box flex="0 0 66.67%">
          <Typography noWrap>Document from {meeting ? meeting.summary : 'this meeting'}</Typography>
        </Box>
      </Box>
    </div>
  );
};

const ConditionalWrapper = ({ shouldWrap, wrapper, children }: any) =>
  shouldWrap ? wrapper(children) : children;

const DocumentRow = (props: {
  document: IDocument;
  selectedDocumentId: string | null;
  store: IStore;
  tooltipText?: string;
  text?: string;
  noMargins?: boolean;
}) => {
  const isSelected = props.selectedDocumentId === props.document.id;
  const navigate = useNavigate();

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [isDetailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <div
      className={clsx(
        'document-row-root',
        'document-row',
        props.noMargins && 'document-row-small',
        isSelected && 'document-row-primary-main',
      )}
      onMouseEnter={() => setDetailsVisible(true)}
      onMouseLeave={() => setDetailsVisible(false)}
      onClick={(event) => {
        event.stopPropagation();
        if (props.document.link) {
          window.open(props.document.link);
        }
        return false;
      }}
      ref={setReferenceElement as any}
    >
      <ConditionalWrapper
        shouldWrap={!!props.tooltipText}
        wrapper={(children: any) => <Tooltip title={props.tooltipText!}>{children}</Tooltip>}
      >
        <Box display="flex" alignItems="center">
          <Box className="document-row-left">
            <IconButton size="small">
              <img
                alt="Document Icon"
                src={props.document.iconLink}
                className="document-row-image"
              />
            </IconButton>
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography noWrap className="document-row-top-padding">
              {props.document.name}
            </Typography>
          </Box>
          {isDetailsVisible && (
            <Box className="document-row__actions">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  void navigate(`/documents/${props.document.id}`);
                  return false;
                }}
              >
                <SearchIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
              </IconButton>
            </Box>
          )}
        </Box>
      </ConditionalWrapper>
    </div>
  );
};

export default DocumentRow;
