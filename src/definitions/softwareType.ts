import S from "fluent-json-schema";
import { kinds } from "../constants";

export default S.string().enum(kinds);
