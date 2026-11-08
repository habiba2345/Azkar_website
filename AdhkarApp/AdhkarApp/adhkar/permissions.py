from rest_framework.permissions import BasePermission, SAFE_METHODS


class ReadOnlyOrAdmin(BasePermission):
    """
    مستخدَمة في endpoints الأقسام: القراءة متاحة للجميع، والتعديل/الحذف/الإضافة للأدمن بس.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return request.user.is_authenticated and request.user.is_staff


class AdhkarPermission(BasePermission):
    """
    صلاحيات الأذكار:
    - القراءة (GET) متاحة لأي حد، حتى لو مش مسجل دخول.
    - الإضافة (POST) متاحة لأي مستخدم مسجل دخول؛ هيتحط الذكر بتاعه تلقائيًا
      في قسم "ذكر حر" وهو اللي هيبقى صاحبه (مالكه).
    - التعديل والحذف متاحين بس لصاحب الذكر نفسه، أو للأدمن (is_staff) اللي
      يقدر يتحكم في كل الأذكار (الرسمية وأذكار المستخدمين).
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        return obj.owner_id == request.user.id
