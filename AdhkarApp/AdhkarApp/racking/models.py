from adhkar.models import Adhkar
from django.conf import settings
from django.db import models

class UserProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    adhkar = models.ForeignKey(Adhkar, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)
    points_earned = models.IntegerField()

    def __str__(self):
        return f"{self.user.username} finished {self.adhkar.title}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # النص اللي المستخدم كاتبه لنفسه (مثلاً "أذكار الصباح")، بيتبعت في الإيميل
    title = models.CharField(max_length=255, blank=True, default='')
    is_enabled = models.BooleanField(default=True)
    reminder_time = models.TimeField()
    # آخر يوم اتبعت فيه إيميل للتذكير ده - بتستخدم عشان (أ) نمنع إرسال أكتر
    # من إيميل في نفس اليوم، و(ب) نظهر علامة صح على التذكير اللي حصل النهاردة
    last_sent_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Reminder for {self.user.username} at {self.reminder_time}"