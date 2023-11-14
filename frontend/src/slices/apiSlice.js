import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '' });

// eslint-disable-next-line import/prefer-default-export
export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User'],
  // eslint-disable-next-line no-unused-vars
  endpoints: (builder) => ({}),
});
