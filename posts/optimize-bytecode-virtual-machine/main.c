#include <stdio.h>
#include <stdint.h>

typedef uint8_t  u8;    // for opcode
typedef uint16_t u16;   //   _ arg
typedef uint32_t u32;   //   _ instruction
typedef uint64_t u64;   //   _ value, constant

typedef enum {
    OP_HLT = 0,         // return value
    OP_LDK = 1,         // constant = constants[arg]
    OP_ADD = 2,         // value += constant
    OP_SUB = 3,         // value -= constant
    OP_LEQ = 4          // if value <= constant, pc -= arg
} OpCode;

#ifdef OPCODE_BYTE
typedef u8 Inst;
#else
typedef union {
    struct {
        OpCode op :  6; // OP  |
        u32       :  8; // A   | 
        u32   arg : 18; // Bx  |
    };                  //     v
    u32 n;              // -> 32bit
} Inst;
#endif

#ifdef OPCODE_BYTE
#define EMIT_HLT()  (OP_HLT)
#define EMIT_LDK(k) (OP_LDK), ((k) & 0xff), (((k) >> 8) & 0xff)
#define EMIT_ADD()  (OP_ADD)
#define EMIT_SUB()  (OP_SUB)
#define EMIT_LEQ(n) (OP_LEQ), ((n) & 0xff), (((n) >> 8) & 0xff)
#else
#define EMIT_HLT()  ((Inst) { .op = OP_HLT })
#define EMIT_LDK(k) ((Inst) { .op = OP_LDK, .arg = (k) })
#define EMIT_ADD()  ((Inst) { .op = OP_ADD })
#define EMIT_SUB()  ((Inst) { .op = OP_SUB })
#define EMIT_LEQ(n) ((Inst) { .op = OP_LEQ, .arg = (n) })
#endif

static u64 exec(Inst *code, u64 *consts) {
    const Inst *pc;
    u64 value, constant;
    
    value = 0;
    constant = 0;
    pc = code;

#ifdef OPCODE_BYTE
#define GET_OP()    (*pc++)
#define GET_ARG()   (pc += 2, pc[-2] | ((pc)[-1] << 8))
#else
#define GET_OP()    (pc++)->op
#define GET_ARG()   (pc-1)->arg
#endif

#if defined(__GNUC__) || defined(__clang__)
#define DISPATCH() goto *__jt[GET_OP()];
#define CODE(op)   __##op
#define NEXT()     DISPATCH()
    static void *__jt[] = {
        &&CODE(OP_HLT),
        &&CODE(OP_LDK),
        &&CODE(OP_ADD),
        &&CODE(OP_SUB),
        &&CODE(OP_LEQ)
    };
#else
#if 0 // defined(_WIN32) || defined(_M_IX86)
    static void *__jt[5];
#define DISPATCH()              \
    do {                        \
        int i = GET_OP();       \
        __asm mov ecx, [i]      \
        __asm shl ecx, [2]      \
        __asm jmp [__jt+ecx]    \
    } while (0);
#define CODE(op)   __##op
#define NEXT()     DISPATCH()
    if (!__jt[0]) __asm {
        mov ecx, [0]
        mov [__jt+ecx], offset CODE(OP_HLT)
        add ecx, [4]
        mov [__jt+ecx], offset CODE(OP_LDK)
        add ecx, [4]
        mov [__jt+ecx], offset CODE(OP_ADD)
        add ecx, [4]
        mov [__jt+ecx], offset CODE(OP_SUB)
        add ecx, [4]
        mov [__jt+ecx], offset CODE(OP_LEQ)
    }
#else
#define DISPATCH() for (;;) switch(GET_OP())
#define CODE(op)   case op
#define NEXT()     continue
#endif
#endif

/* another way, can instead of computed goto
#define DISPATCH() __dsp: switch(GET_OP())
#define CODE(op)   case op
#define NEXT()     goto __dsp
*/

    DISPATCH() {
        CODE(OP_HLT): {
            return value;   // returns away
        }
        CODE(OP_ADD): {
            value += constant;
            NEXT();
        }
        CODE(OP_SUB): {
            value -= constant;
            NEXT();
        }
        CODE(OP_LDK): {
            int slot = GET_ARG();
            constant = consts[slot];
            NEXT();
        }
        CODE(OP_LEQ): {
            int offset = GET_ARG();
            if (value <= constant) \
                pc -= offset;
            NEXT();    
        }
    }
} // end exec(...)

int main() {
    u64 consts[] = {4, 5, 1234567890};
    Inst code[] = {
        EMIT_LDK(0),    // 0. load 4
        EMIT_SUB(),     // 1. sub
        EMIT_LDK(1),    // 2. load 5
        EMIT_ADD(),     // 3. add
        EMIT_LDK(2),    // 4. load 1234567890
#ifdef OPCODE_BYTE
        EMIT_LEQ(10),   // 5. if <= 1234567890, jump back 10
#else
        EMIT_LEQ(4),    //  _ if <= 1234567890, jump back 4
#endif
        EMIT_HLT()      // 6. halt
    };
    u64 result = exec(code, consts);
    printf("result: %lld\n", result);   
}
