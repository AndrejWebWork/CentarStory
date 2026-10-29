import type { Copy } from "@/content/types";
import type { RelationshipKind, VerificationStatus } from "@/content/knowledge/schema";

export type GraphEdge = {
  id: string;
  kind: RelationshipKind;
  from: string;
  to: string;
  historical: boolean;
  explanation: Copy;
  sourceIds: string[];
  verificationStatus: VerificationStatus;
  themeIds: string[];
};

export type GraphLeg = GraphEdge & {
  practical: boolean;
};
