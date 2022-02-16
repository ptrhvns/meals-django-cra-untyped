def has_http_method_names(view, expected_method_names):
    actual_method_names = sorted(view.view_class.http_method_names)
    return expected_method_names == actual_method_names


def has_permission_classes(view, expected_permission_classes):
    actual_permission_classes = view.view_class.permission_classes
    return expected_permission_classes == actual_permission_classes
