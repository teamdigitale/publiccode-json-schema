import S from "fluent-json-schema";
import { statuses } from "../constants";

export default S.string().enum(statuses);
