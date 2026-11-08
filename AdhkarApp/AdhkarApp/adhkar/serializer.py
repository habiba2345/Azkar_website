from rest_framework import serializers
from .models import *


class AdhkarSerializer(serializers.ModelSerializer):
    # اسم صاحب الذكر (لو ذكر خاص أضافه مستخدم)، للعرض بس
    owner_username = serializers.ReadOnlyField(source='owner.username')
    # هل الذكر ده ملك المستخدم الحالي؟ عشان الفرونت يعرف يظهر أزرار تعديل/حذف ولا لأ
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Adhkar
        fields = ['id', 'category', 'title', 'content', 'points_value', 'owner', 'owner_username', 'is_owner']
        read_only_fields = ['owner']
        extra_kwargs = {
            # مش مطلوب من المستخدم العادي يبعته أصلًا - الـ view هو اللي
            # بيحدده تلقائيًا (قسم "ذكر حر") في perform_create.
            # لسه مطلوب لما الأدمن يضيف ذكر رسمي (مُتحقق منه في الـ view).
            'category': {'required': False},
        }

    def get_is_owner(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            return obj.owner_id == user.id
        return False


class CategorySerializer(serializers.ModelSerializer):
    # id مطلوب عشان الفرونت يقدر يميّز قسم "ذكر حر" عن باقي الأقسام بدقة
    adhkar_count = serializers.IntegerField(source='adhkar_list.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'adhkar_count']
