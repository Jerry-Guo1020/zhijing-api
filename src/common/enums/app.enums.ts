export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ReplyStyle {
  CONCISE = 'concise',
  DETAILED = 'detailed',
  ENCOURAGING = 'encouraging',
  EXAM_ORIENTED = 'exam_oriented',
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  MIXED = 'mixed',
}

export enum PackStatus {
  DRAFT = 'draft',
  PARSING = 'parsing',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  FAILED = 'failed',
}

export enum MaterialParseStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  JUDGE = 'judge',
  FILL_BLANK = 'fill_blank',
  SHORT_ANSWER = 'short_answer',
}

export enum PracticeSessionType {
  CHAPTER = 'chapter',
  WRONG_BOOK = 'wrong_book',
  SIMILAR = 'similar',
  CUSTOM = 'custom',
}

export enum PracticeSessionStatus {
  DRAFT = 'draft',
  ONGOING = 'ongoing',
  SUBMITTED = 'submitted',
}

export enum WrongQuestionStatus {
  PENDING_REVIEW = 'pending_review',
  REVIEWING = 'reviewing',
  MASTERED = 'mastered',
}

export enum FlashcardType {
  WORD = 'word',
  TERM = 'term',
  CONCEPT = 'concept',
  DEFINITION = 'definition',
  CUSTOM = 'custom',
}

export enum FlashcardMasteryLevel {
  NEW = 'new',
  VAGUE = 'vague',
  FAMILIAR = 'familiar',
  MASTERED = 'mastered',
}

export enum FlashcardReviewStatus {
  DUE = 'due',
  REVIEWED = 'reviewed',
  SUSPENDED = 'suspended',
}

export enum FlashcardReviewRating {
  UNKNOWN = 'unknown',
  VAGUE = 'vague',
  REMEMBERED = 'remembered',
  MASTERED = 'mastered',
}

export enum TaskType {
  CHAPTER = 'chapter',
  PRACTICE = 'practice',
  WRONG_BOOK = 'wrong_book',
  FLASHCARD = 'flashcard',
  FOCUS = 'focus',
  CUSTOM = 'custom',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum FocusStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
}

export enum PostType {
  HELP = 'help',
  WRONG_QUESTION = 'wrong_question',
  REVIEW = 'review',
  EXPERIENCE = 'experience',
  AI_VERIFICATION = 'ai_verification',
}

export enum PostStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}

export enum CommentStatus {
  PUBLISHED = 'published',
  DELETED = 'deleted',
}

export enum LikeTargetType {
  POST = 'post',
  COMMENT = 'comment',
}

export enum TargetPlanStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum ReportType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum AiProviderType {
  OPENAI_COMPATIBLE = 'openai_compatible',
  CUSTOM = 'custom',
}

export enum AiProviderTestStatus {
  UNTESTED = 'untested',
  SUCCESS = 'success',
  FAILED = 'failed',
}
