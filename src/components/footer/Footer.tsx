import { Heart, Mail, Github } from 'lucide-react';
import { Separator } from '../ui/separator';
import ChangeUpLogo from '../ui/ChangeUpLogo';
import LumpenLogo from '../ui/LumpenLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appVersion = '1.0.0';

  return (
    <footer className="bg-card border-t border-border mt-auto">
      {/* Main Footer Content - Hidden on mobile when bottom nav is present */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* App Info */}
              <div className="">
                <div className="flex items-center gap-3">
                  {/* <ChangeUpLogo size="md" /> */}
                  <LumpenLogo size="lg" showText={true} />
                  <div>
                    {/* <h3 className="font-medium">ChangeUp</h3> */}
                    <p className="text-sm text-muted-foreground">
                      v{appVersion}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  변화의 시작, 건강한 체중 관리
                  <br />
                  친구들과 함께하는 스마트한 솔루션
                </p>
              </div>

              {/* Contact & Info */}
              <div className="space-y-4">
                <h4 className="font-medium">정보</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>문의: a10019610@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Github className="h-4 w-4" />
                    <span>GitHub: https://github.com/20220330jin/baff_be</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs text-primary">
                    <Heart className="h-3 w-3" />
                    <span>소셜 로그인 지원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Bar */}
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <p>© {currentYear} Lumpen. All rights reserved.</p>
              </div>
              <div className="flex items-center gap-4">
                <Separator orientation="vertical" className="h-4" />
                <span>개인정보처리방침</span>
                <Separator orientation="vertical" className="h-4" />
                <span>이용약관</span>
                <Separator orientation="vertical" className="h-4" />
                <span>문의하기</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer - Minimal version that shows above bottom navigation */}
      <div className="md:hidden bg-muted/30 mb-16">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <ChangeUpLogo size="xs" />
              <span className="font-medium">ChangeUp</span>
              <span className="text-muted-foreground">v{appVersion}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              변화의 시작 • © {currentYear} Lumpen
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>•</span>
              <span>개인정보처리방침</span>
              <span>•</span>
              <span>이용약관</span>
              <span>•</span>
              <span>문의하기</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
