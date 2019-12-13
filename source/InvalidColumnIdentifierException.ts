
/**
 * An exception thrown when an table was requested in a SQL statement and it does not exist
 */
export class InvalidColumnIdentifierException extends Error {
  public readonly queryStatement: string;

  constructor(queryStatement: string, message?: string) {
      super(message);
      this.queryStatement = queryStatement;
  }
}
