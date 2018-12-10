export default interface IDataAccessDoc {

    integrationType: string,
    queries, // Array of query objects: { query, integrationType }
    header: string[], // Array of elements representing individual markdown lines before table
    footer: string[], // Array of elements representing individual markdown lines after table
    getQueryInfo(): object[], // Derives array of { tableName: string, fields: string[] } objects from this.queries
    createTable(): string[], // Returns .md table - format is an array, with each element representing a line of markdown
    create() // Writes document (header + createTable() + footer) => path/to/file.md

}