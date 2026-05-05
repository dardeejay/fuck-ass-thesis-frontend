'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowUpRight,
  Clock3,
  Filter,
  Globe,
  ImageIcon,
  Megaphone,
  TrendingUp,
} from 'lucide-react'

type Channel = 'Facebook Page' | 'Twitter/X' | 'Instagram'
type Status = 'Scheduled' | 'Draft' | 'Review' | 'Published'

type ScheduledPost = {
  id: number
  title: string
  channels: Channel[]
  status: Status
  publishAt: string
  campaign: string
  owner: string
  approval: string
  engagementScore: number
}

type AutomationRule = {
  id: number
  name: string
  trigger: string
  action: string
  active: boolean
}

const scheduledPosts: ScheduledPost[] = [
  {
    id: 1,
    title: 'Typhoon preparedness checklist for barangay leaders',
    channels: ['Facebook Page', 'Instagram'],
    status: 'Scheduled',
    publishAt: 'Today, 4:30 PM',
    campaign: 'Storm Readiness',
    owner: 'Mika Dela Cruz',
    approval: 'Approved by Comms',
    engagementScore: 88,
  },
  {
    id: 2,
    title: 'Heat index advisory with hydration reminders',
    channels: ['Facebook Page', 'Twitter/X'],
    status: 'Review',
    publishAt: 'Tomorrow, 8:00 AM',
    campaign: 'Daily Advisories',
    owner: 'Jon Santiago',
    approval: 'Pending review',
    engagementScore: 71,
  },
  {
    id: 3,
    title: 'Flood-safe routes and evacuation center carousel',
    channels: ['Instagram', 'Facebook Page'],
    status: 'Draft',
    publishAt: 'May 7, 1:00 PM',
    campaign: 'Community Safety',
    owner: 'Aira Ramos',
    approval: 'Needs legal note',
    engagementScore: 63,
  },
  {
    id: 4,
    title: 'School suspension announcement template',
    channels: ['Facebook Page', 'Twitter/X'],
    status: 'Published',
    publishAt: 'May 4, 6:15 AM',
    campaign: 'Emergency Broadcasts',
    owner: 'Paolo Reyes',
    approval: 'Published',
    engagementScore: 94,
  },
]

const automationRules: AutomationRule[] = [
  {
    id: 1,
    name: 'Weather escalation broadcast',
    trigger: 'Rainfall above 30mm or flood alert raised',
    action: 'Send approved advisory copy to the Facebook page and Twitter/X',
    active: true,
  },
  {
    id: 2,
    name: 'Morning digest auto-queue',
    trigger: 'Every day at 6:00 AM',
    action: 'Queue weather summary and commuter reminder post',
    active: true,
  },
  {
    id: 3,
    name: 'Approval fallback reminder',
    trigger: 'Post remains in review for 2 hours',
    action: 'Notify duty approver and reassign to backup editor',
    active: false,
  },
]

const platformStats = [
  { name: 'Facebook Page', queued: 18, fill: 78, icon: Globe },
  { name: 'Instagram', queued: 12, fill: 64, icon: ImageIcon },
  { name: 'Twitter/X', queued: 9, fill: 52, icon: Megaphone },
  { name: 'Cross-channel sync', queued: 7, fill: 36, icon: TrendingUp },
]

const calendarBlocks = [
  { label: '6 AM', title: 'Weather advisory', state: 'Live', tone: 'bg-chart-2/18 text-chart-2 border-chart-2/25' },
  { label: '9 AM', title: 'Transport update', state: 'Queued', tone: 'bg-primary/15 text-primary border-primary/20' },
  { label: '12 PM', title: 'Preparedness reel', state: 'Review', tone: 'bg-chart-1/18 text-chart-4 border-chart-4/20' },
  { label: '4 PM', title: 'Class suspension card', state: 'Ready', tone: 'bg-success/15 text-primary border-primary/25' },
  { label: '7 PM', title: 'Evening recap thread', state: 'Draft', tone: 'bg-muted text-muted-foreground border-border' },
]

function statusTone(status: Status) {
  switch (status) {
    case 'Scheduled':
      return 'bg-primary/12 text-primary border-primary/20'
    case 'Published':
      return 'bg-chart-2/18 text-chart-2 border-chart-2/25'
    case 'Review':
      return 'bg-chart-1/18 text-chart-4 border-chart-4/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export default function SocialPostsClient() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | Status>('all')
  const [selectedChannel, setSelectedChannel] = useState<'all' | Channel>('all')
  const [composerChannel, setComposerChannel] = useState<Channel>('Facebook Page')
  const [caption, setCaption] = useState(
    'Heavy rainfall is expected this afternoon. Keep emergency kits ready, monitor barangay channels, and avoid flooded roads unless absolutely necessary.'
  )

  const filteredPosts = useMemo(() => {
    return scheduledPosts.filter((post) => {
      const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus
      const matchesChannel =
        selectedChannel === 'all' || post.channels.includes(selectedChannel)
      return matchesStatus && matchesChannel
    })
  }, [selectedChannel, selectedStatus])

  const overview = useMemo(
    () => ({
      queued: scheduledPosts.filter((post) => post.status === 'Scheduled').length,
      draft: scheduledPosts.filter((post) => post.status === 'Draft').length,
      approvals: scheduledPosts.filter((post) => post.status === 'Review').length,
      liveRate: 92,
    }),
    []
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{overview.queued}</p>
              </div>
              <div className="rounded-2xl bg-primary/15 p-3">
                <Clock3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts waiting</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{overview.draft}</p>
              </div>
              <div className="rounded-2xl bg-muted p-3">
                <Megaphone className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs approval</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{overview.approvals}</p>
              </div>
              <div className="rounded-2xl bg-chart-1/18 p-3">
                <Filter className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publish success</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{overview.liveRate}%</p>
              </div>
              <div className="rounded-2xl bg-chart-2/18 p-3">
                <ArrowUpRight className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <Tabs defaultValue="queue" className="min-w-0 gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Content operations</h3>
              <p className="text-sm text-muted-foreground">
                Review upcoming posts, publishing windows, and workflow handoffs.
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="queue">Queue</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="automation">Automations</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Scheduled posts</CardTitle>
                    <CardDescription>
                      Filter by status or destination to find anything that needs attention.
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="min-w-40">
                      <Select
                        value={selectedStatus}
                        onValueChange={(value) =>
                          setSelectedStatus(value as 'all' | Status)
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-40">
                      <Select
                        value={selectedChannel}
                        onValueChange={(value) =>
                          setSelectedChannel(value as 'all' | Channel)
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="All destinations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All destinations</SelectItem>
                          <SelectItem value="Facebook Page">Facebook Page</SelectItem>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="Twitter/X">Twitter/X</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Post</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Destinations</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Approval</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="align-top">
                            <div>
                              <p className="font-medium text-foreground">{post.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {post.campaign} · {post.owner}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusTone(post.status)}>
                              {post.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {post.channels.map((channel) => (
                                <Badge key={channel} variant="secondary">
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {post.publishAt}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {post.approval}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-foreground">
                              {post.engagementScore}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Publishing calendar</CardTitle>
                <CardDescription>
                  A quick view of today&apos;s post rhythm across your connected channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {calendarBlocks.map((block) => (
                  <div
                    key={block.label}
                    className="grid gap-3 rounded-2xl border border-border bg-background/70 p-4 md:grid-cols-[84px_1fr_auto]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{block.label}</p>
                      <p className="text-xs text-muted-foreground">{block.state}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{block.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Smart distribution enabled for Facebook Page, Twitter/X, and Instagram.
                      </p>
                    </div>
                    <Badge variant="outline" className={block.tone}>
                      {block.state}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <Card>
              <CardHeader>
                <CardTitle>Automation rules</CardTitle>
                <CardDescription>
                  Keep repetitive posting flows reliable while still routing sensitive content for review.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {automationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-background/80 p-4 md:flex-row md:items-start md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{rule.name}</p>
                        <Badge variant={rule.active ? 'default' : 'secondary'}>
                          {rule.active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Trigger: {rule.trigger}</p>
                      <p className="text-sm text-muted-foreground">Action: {rule.action}</p>
                    </div>
                    <Switch checked={rule.active} aria-label={rule.name} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="min-w-0 space-y-6 2xl:sticky 2xl:top-22 2xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Quick composer</CardTitle>
              <CardDescription>
                Draft a post, pick the destination, and hand it to the queue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                defaultValue="Community advisory"
                aria-label="Post title"
                className="bg-background"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  value={composerChannel}
                  onValueChange={(value) => setComposerChannel(value as Channel)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Primary destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook Page">Facebook Page</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Twitter/X">Twitter/X</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="scheduled">
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Schedule for later</SelectItem>
                    <SelectItem value="review">Send to review</SelectItem>
                    <SelectItem value="publish">Publish immediately</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                className="min-h-32 bg-background"
              />
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Preview notes</p>
                    <p className="text-sm text-muted-foreground">
                      {composerChannel} copy is in a healthy range for engagement and readability.
                    </p>
                  </div>
                  <Badge variant="outline">{caption.length} chars</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-primary text-primary-foreground">Add to queue</Button>
                <Button variant="outline">Save draft</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channel readiness</CardTitle>
              <CardDescription>
                Track how full each destination queue is before the next advisory cycle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {platformStats.map((platform) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-muted p-2">
                        <platform.icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{platform.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {platform.queued} posts queued
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {platform.fill}%
                    </span>
                  </div>
                  <Progress value={platform.fill} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested next steps</CardTitle>
              <CardDescription>
                Small operational improvements based on the current queue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="font-medium text-foreground">Add one more evening-ready advisory</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your 7 PM slot is still draft-only and could leave emergency coverage thin.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="font-medium text-foreground">Escalate legal review for the flood route carousel</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  That asset has the biggest reach potential but is blocked by approval notes.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="font-medium text-foreground">Enable the approval fallback reminder</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Turning it on should reduce review stalls during severe weather windows.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
