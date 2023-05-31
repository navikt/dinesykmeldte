interface Props {
    error?: unknown
}

const Skeleton = ({ error }: Props): JSX.Element | null => {
    if (error) return null
    return (
        <span className="w-full animate-pulse">
            <div className="h-5 w-48 bg-gray-500" />
        </span>
    )
}

export default Skeleton
