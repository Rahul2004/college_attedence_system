import React from 'react';
import HttpErrorPage from './errors/HttpErrorPage';

export default function NotFoundPage() {
  return (
    <HttpErrorPage
      code={404}
      title="404 — Academic Page Not Found"
      message="The requested academic portal route or student record does not exist or has been relocated by college administration."
    />
  );
}

