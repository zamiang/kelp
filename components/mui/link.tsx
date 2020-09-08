// SOURCE: https://github.com/mui-org/material-ui/blob/master/examples/nextjs/src/Link.js
import MuiLink from '@material-ui/core/Link';
import clsx from 'clsx';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

interface INextComposedProps {
  as: any;
  href: string;
  prefetch: boolean;
}

const NextComposed = React.forwardRef(function NextComposed(props: INextComposedProps, ref) {
  const { as, href, ...other } = props;

  return (
    <NextLink href={href} as={as}>
      <a ref={ref} {...other} />
    </NextLink>
  );
});

interface ILinkProps {
  activeClassName: string;
  as: any;
  className: string;
  href: string;
  innerRef: any;
  onClick: () => null;
  prefetch: boolean;
}

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
function Link(props: ILinkProps) {
  const { href, activeClassName = 'active', className: classNameProps, innerRef, ...other } = props;

  const router = useRouter();
  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === href && activeClassName,
  });

  return (
    <MuiLink component={NextComposed} className={className} ref={innerRef} href={href} {...other} />
  );
}

export default React.forwardRef((props: ILinkProps, ref) => <Link {...props} innerRef={ref} />);
