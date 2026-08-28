import { redirect } from "next/navigation";

/** Provides a stable entry URL for the leading REVA-blue editorial experiment. */
export default function RevaBluePlaygroundIndex() { redirect("/playground/reva-blue/a"); }
