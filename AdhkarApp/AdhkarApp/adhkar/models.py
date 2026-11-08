from django.conf import settings
from django.db import models

# اسم قسم "الذكر الحر" الثابت اللي بيضاف فيه أي ذكر يكتبه المستخدم بنفسه
FREE_CATEGORY_NAME = "ذكر حر"


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Adhkar(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='adhkar_list')
    title = models.CharField(max_length=255)
    content = models.TextField()
    points_value = models.IntegerField(default=1)
    # المستخدم اللي أضاف الذكر ده بنفسه (في قسم "ذكر حر" مثلًا).
    # null=True عشان الأذكار الرسمية اللي بيضيفها الأدمن ملهاش "مالك".
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='custom_adhkar',
    )

    def __str__(self):
        return self.title
