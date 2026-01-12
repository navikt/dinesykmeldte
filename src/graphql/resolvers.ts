import { isLocalOrDemo } from "../utils/env";
import mockResolvers from "./resolvers/mockresolvers/mockResolvers";
import realResolvers from "./resolvers/rootResolver";

export default isLocalOrDemo ? mockResolvers : realResolvers;
