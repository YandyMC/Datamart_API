const connectionString = `
  Server=${import.meta.env.SERVER};
  Database=${import.meta.env.DATABASE};
  Trusted_Connection=${import.meta.env.TRUSTED_CONNECTION};
  Driver=${import.meta.env.ODBC_DRIVER}
`

export { connectionString }
