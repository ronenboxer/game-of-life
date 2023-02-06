// { onRemoveShape }: { onRemoveShape: Function }
export function RemoveIcon({ onDeleteShape }: { onDeleteShape: Function }) {

    return (
        <label className="delete-trigger-container flex center">
            <input hidden type="checkbox" className="delete-trigger" onChange={()=>onDeleteShape()}></input>
            <div className="bin-icon">
                <div className="lid"></div>
                <div className="box">
                    <div className="box-inner">
                        <div className="bin-lines"></div>
                    </div>
                </div>
            </div>
        </label>
    )
}