import S from "fluent-json-schema";
import { versions } from "../constants";

export default S.string().enum(versions);
