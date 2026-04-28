import { getDb } from "./connection";
import { respondents } from "@db/schema";
import { desc } from "drizzle-orm";

export async function getAllRespondents() {
  return getDb().select().from(respondents).orderBy(desc(respondents.createdAt));
}

export async function createRespondent(data: {
  name: string;
  department: string;
  workDuration: string;
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
  q11: number; q12: number; q13: number; q14: number; q15: number;
  q16: number; q17: number; q18: number; q19: number; q20: number;
  q21: number; q22: number; q23: number; q24: number; q25: number;
  q26: number; q27: number; q28: number; q29: number; q30: number;
  q31: number; q32: number; q33: number; q34: number; q35: number;
  q36: number; q37: number; q38: number; q39: number; q40: number;
  q41: number; q42: number; q43: number; q44: number; q45: number;
  q46: number; q47: number; q48: number;
}) {
  const result = await getDb().insert(respondents).values(data).$returningId();
  return result[0].id;
}
