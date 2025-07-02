import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  type: "info" | "warning" | "error"
  message: string
  timestamp: string
}

interface ActivityFeedProps {
  activities: Activity[]
  isLoading?: boolean
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      case "info":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading activities...</div>
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <Badge variant={getTypeColor(activity.type)} className="mt-1">
            {activity.type.toUpperCase()}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
            <p className="text-sm">{activity.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
