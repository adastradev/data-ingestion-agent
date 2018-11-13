export default interface IDDLHelper<TDDLForObjects, TDDLResult> {
    getDDLQuery: (objects: TDDLForObjects[]) => TDDLResult;
}
