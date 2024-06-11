import { supabaseClient } from "./util/supabaseClient";
import { DBResult } from "./entities/DbResult";

export class DB {
  private table: string;

  constructor(tableName: string) {
    this.table = tableName;
  }

  public async select({
    columns = ["*"],
    joins = [],
    wheres = [],
  }: {
    columns?: string[];
    joins?: { table: string; columns: string[] }[];

    wheres?: {
      column: string;
      operator: "eq" | "!=" | "<" | ">" | "<=" | ">=";
      value: any;
    }[];
  } = {}): Promise<DBResult> {
    try {
      if (joins.length > 0) {
        for (const join of joins) {
          columns.push(
            `${join.table} (${
              join.columns.length > 0 ? join.columns.join(", ") : "*"
            })`
          );
        }
      }
      let query = supabaseClient
        .from(this.table)
        .select(
          columns.length > 0 && columns[0] !== "*"
            ? columns.join(", ")
            : columns[0]
        );

      for (const where of wheres) {
        query = query.filter(where.column, where.operator, where.value);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        data: error,
        message: "",
      };
    }
  }

  public async insert(
    insertData: any,
    {
      returnResut = false,
      resultColumns = ["*"],
    }: { returnResut?: boolean; resultColumns?: string[] } = {}
  ): Promise<DBResult> {
    try {
      let query = supabaseClient.from(this.table).insert(insertData);

      if (returnResut) {
        query.select(
          resultColumns[0] != "*" ? resultColumns.join(", ") : resultColumns[0]
        );
      }

      const { error, data } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        message: "",
      };
    } catch (error) {
      return {
        success: false,
        data: error,
        message: "",
      };
    }
  }

  public async update(id: string, data: any): Promise<DBResult> {
    try {
      const { error } = await supabaseClient
        .from(this.table)
        .update(data)
        .match({ id: id });

      if (error) {
        throw error;
      }
      return {
        success: true,
        data: data,
        message: "",
      };
    } catch (error) {
      return {
        success: false,
        data: error,
        message: "",
      };
    }
  }

  public async delete(id: string): Promise<any> {
    const { error } = await supabaseClient
      .from(this.table)
      .delete()
      .match({ id: id });

    if (error) {
      throw error;
    }
  }
}
